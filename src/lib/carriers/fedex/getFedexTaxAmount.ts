import * as Sentry from '@sentry/nextjs';

import { CarrierAccountTypeEnum, carrierMessages } from '@/constants';
import { CarrierTypes } from '@/types/carrier';
import { ShippingTypes } from '@/types/shipping';

const BASE_URL = 'https://apis-sandbox.fedex.com';

const { AUTH_FAILED, SHIPMENT_FAILED } = carrierMessages;

interface FedexTaxItem {
  amount: number;
  currency: string;
  description?: string;
  formula?: string;
  note?: string;
}

interface FedexEdtDetail {
  duties?: FedexTaxItem[];
  fees?: FedexTaxItem[];
  taxes?: FedexTaxItem[];
  summary?: {
    totalDuties: number;
    totalFees: number;
    totalShippingCosts: number;
    totalTaxes: number;
    totalLandedCost: number;
    currency: string;
  };
}

interface FedexTaxResponse {
  transactionId: string;
  customerTransactionId?: string;
  output?: {
    edtDetails?: FedexEdtDetail[];
  };
}

const getFedexTaxAmount = async (params: CarrierTypes.ICarrierTaxParams): Promise<number> => {
  const { accountType, credentials, shippingInstance } = params;

  const { consignee, content, cost, detail } = shippingInstance;

  const authRes = await fetch(`${BASE_URL}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: credentials.apiKey,
      client_secret: credentials.secretKey,
    }),
  });

  if (!authRes.ok) {
    const responseText = await authRes.text();

    const error = new Error(`${AUTH_FAILED}: HTTP ${authRes.status} - ${responseText}`);

    Sentry.captureException(error, {
      extra: {
        responseStatus: authRes.status,
        responseBody: responseText,
        endpoint: `${BASE_URL}/oauth/token`,
      },
    });

    throw error;
  }

  const authData = await authRes.json();

  const serviceType = accountType === CarrierAccountTypeEnum.ECONOMY ? 'INTERNATIONAL_ECONOMY' : 'INTERNATIONAL_PRIORITY';

  const payload = {
    shipper: {
      countryCode: 'TR',
    },

    recipient: {
      countryCode: consignee.address.country,
    },

    commodities: content.products.map((product: ShippingTypes.IProduct) => ({
      commodityName: product.name,
      countryOfManufacture: 'TR',
      description: product.name,
      harmonizedCode: product.gtip,
      quantity: product.piece,

      unitPrice: {
        amount: product.unitPrice,
        currencyCode: content.currency,
      },
    })),

    shipmentPurpose: detail.purpose,

    serviceType,

    shippingCost: {
      amount: cost,
      currency: content.currency,
    },
  };

  const taxRes = await fetch(`${BASE_URL}/dutytax/v1/estimate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authData.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const responseText = await taxRes.text();

  let responseData: FedexTaxResponse | null;
  try {
    responseData = JSON.parse(responseText) as FedexTaxResponse;
  } catch {
    responseData = null;
  }

  if (!taxRes.ok || !responseData) {
    const error = new Error(`${SHIPMENT_FAILED}: HTTP ${taxRes.status} - ${responseText}`);

    Sentry.captureException(error, {
      extra: {
        responseStatus: taxRes.status,
        responseStatusText: taxRes.statusText,
        responseBody: responseData ?? responseText,
        endpoint: `${BASE_URL}/dutytax/v1/estimate`,
        destinationCountry: consignee.address.country,
        serviceType,
        shipmentPurpose: detail.purpose,
        shippingCost: cost,
        currency: content.currency,
        commodities: content.products.map((product: ShippingTypes.IProduct) => ({
          name: product.name,
          gtip: product.gtip,
          piece: product.piece,
          unitPrice: product.unitPrice,
        })),
      },
    });

    throw error;
  }

  const edtDetails = responseData.output?.edtDetails;

  if (!edtDetails?.length) {
    const error = new Error(`${SHIPMENT_FAILED}: FedEx duty & tax bilgisi bulunamadı.`);

    Sentry.captureException(error, {
      extra: {
        transactionId: responseData.transactionId,
        responseBody: responseData,
        destinationCountry: consignee.address.country,
        serviceType,
      },
    });

    throw error;
  }

  const totalAmount = edtDetails.reduce((total, edtDetail) => {
    const duties = (edtDetail.duties ?? []).reduce((sum, item) => sum + item.amount, 0);
    const fees = (edtDetail.fees ?? []).reduce((sum, item) => sum + item.amount, 0);
    const taxes = (edtDetail.taxes ?? []).reduce((sum, item) => sum + item.amount, 0);
    return total + duties + fees + taxes;
  }, 0);

  return Number(totalAmount.toFixed(2));
};

export default getFedexTaxAmount;
