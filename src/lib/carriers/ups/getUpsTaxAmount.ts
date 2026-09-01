import * as Sentry from '@sentry/nextjs';

import { carrierMessages } from '@/constants';
import { CarrierTypes } from '@/types/carrier';
import { ShippingTypes } from '@/types/shipping';

const BASE_URL = 'https://wwwcie.ups.com';

const { AUTH_FAILED, SHIPMENT_FAILED } = carrierMessages;

interface UpsLandedCostResponse {
  shipment?: {
    currencyCode: string;
    importCountryCode: string;
    id: string;
    totalBrokerageFees: number;
    totalDuties: number;
    totalCommodityLevelTaxesAndFees: number;
    totalShipmentLevelTaxesAndFees: number;
    totalVAT: number;
    totalDutyAndTax: number;
    grandTotal: number;
  };
  transID?: string;
  alVersion?: number;
}

const getUpsTaxAmount = async (params: CarrierTypes.ICarrierTaxParams): Promise<number> => {
  const { credentials, shippingInstance } = params;

  const { consignee, content, cost } = shippingInstance;

  const authRes = await fetch(`${BASE_URL}/security/v1/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
    }),
  });

  if (!authRes.ok) {
    const responseText = await authRes.text();

    const error = new Error(`${AUTH_FAILED}: HTTP ${authRes.status} - ${responseText}`);

    Sentry.captureException(error, {
      extra: {
        carrier: 'UPS',
        endpoint: '/security/v1/oauth/token',
        responseStatus: authRes.status,
        responseStatusText: authRes.statusText,
        responseBody: responseText,
      },
    });

    throw error;
  }

  const authData = await authRes.json();

  const transactionId = shippingInstance._id.toString();

  const payload = {
    currencyCode: content.currency,

    transID: transactionId,

    alversion: 1,

    allowPartialLandedCostResult: false,

    shipment: {
      id: transactionId,

      importCountryCode: consignee.address.country,

      exportCountryCode: 'TR',

      transportCost: cost,

      shipmentItems: content.products.map((product: ShippingTypes.IProduct, index: number) => ({
        commodityId: String(index + 1),
        priceEach: product.unitPrice,
        hsCode: product.gtip ?? '',
        quantity: product.piece,
        UOM: 'Each',
        originCountryCode: 'TR',
        commodityCurrencyCode: content.currency,
        description: product.name,
      })),

      shipmentType: 'SALE',
    },
  };

  const landedCostRes = await fetch(`${BASE_URL}/api/landedcost/v1/quotes`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authData.access_token}`,
      'Content-Type': 'application/json',

      transId: transactionId,

      transactionSrc: 'MYD',
    },
    body: JSON.stringify(payload),
  });

  const responseText = await landedCostRes.text();

  const responseData = (() => {
    try {
      return JSON.parse(responseText) as UpsLandedCostResponse;
    } catch {
      return null;
    }
  })();

  if (!landedCostRes.ok || !responseData) {
    const error = new Error(`${SHIPMENT_FAILED}: HTTP ${landedCostRes.status} - ${responseText}`);

    Sentry.captureException(error, {
      extra: {
        carrier: 'UPS',
        endpoint: '/api/landedcost/v1/quotes',
        responseStatus: landedCostRes.status,
        responseStatusText: landedCostRes.statusText,
        responseBody: responseData ?? responseText,
        destinationCountry: consignee.address.country,
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

  const landedCost = responseData.shipment?.grandTotal;

  if (landedCost == null || !Number.isFinite(landedCost)) {
    const error = new Error(`${SHIPMENT_FAILED}: UPS landed cost bilgisi bulunamadı.`);

    Sentry.captureException(error, {
      extra: {
        carrier: 'UPS',
        transactionId: responseData.transID,
        responseBody: responseData,
      },
    });

    throw error;
  }

  return Number(landedCost.toFixed(2));
};

export default getUpsTaxAmount;
