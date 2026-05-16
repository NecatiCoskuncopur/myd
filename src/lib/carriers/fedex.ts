import { carrierMessages } from '@/constants';

const { AUTH_FAILED, SHIPMENT_FAILED, TRACKING_NUMBER_NOT_FOUND } = carrierMessages;

const BASE_URL = 'https://apis-sandbox.fedex.com';

const createFedexLabel = async ({
  shippingInstance,
  accountNumber,
  credentials,
}: CarrierTypes.ICreateFedexLabelParams): Promise<{
  trackingNumber: string;
  label: string;
}> => {
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

  if (!authRes.ok) throw new Error(AUTH_FAILED);

  const authData = await authRes.json();
  const accessToken = authData.access_token;
  const formattedAccountNumber = String(accountNumber).trim();
  const totalProductValue = shippingInstance.content.products.reduce((acc, p) => acc + p.unitPrice * p.piece, 0);
  const productCount = shippingInstance.content.products.length || 1;
  const weightPerProduct = Number((shippingInstance.package.weight / productCount).toFixed(2));
  const payload = {
    labelResponseOptions: 'LABEL',
    accountNumber: {
      value: formattedAccountNumber,
    },
    requestedShipment: {
      shipDatestamp: new Date().toISOString().split('T')[0],
      pickupType: 'USE_SCHEDULED_PICKUP',
      serviceType: 'INTERNATIONAL_PRIORITY',
      packagingType: 'YOUR_PACKAGING',
      shipper: {
        contact: {
          personName: shippingInstance.shipper.name,
          phoneNumber: shippingInstance.shipper.phoneNumber,
        },
        address: {
          streetLines: [shippingInstance.shipper.address.substring(0, 35)],
          city: shippingInstance.shipper.city,
          postalCode: shippingInstance.shipper.postalCode,
          countryCode: 'TR',
        },
      },
      recipients: [
        {
          contact: {
            personName: shippingInstance.recipient.name,
            phoneNumber: shippingInstance.recipient.phoneNumber,
          },
          address: {
            streetLines: [shippingInstance.recipient.address.substring(0, 35)],
            city: shippingInstance.recipient.city,
            ...(['US', 'CA', 'IN'].includes(shippingInstance.recipient.countryCode) && {
              stateOrProvinceCode: shippingInstance.recipient.stateOrProvinceCode,
            }),
            postalCode: shippingInstance.recipient.postalCode.replace(/\s/g, ''),
            countryCode: shippingInstance.recipient.countryCode,
          },
        },
      ],
      shippingChargesPayment: {
        paymentType: shippingInstance?.detail?.payor?.shipping === 'CONSIGNEE' ? 'RECIPIENT' : 'SENDER',
        payor: {
          responsibleParty: {
            accountNumber: { value: formattedAccountNumber },
          },
        },
      },
      customsClearanceDetail: {
        commercialInvoice: {
          shipmentPurpose: shippingInstance.detail.purpose === 'REPAIR_OR_RETURN' ? 'REPAIR_AND_RETURN' : shippingInstance.detail.purpose || 'COMMERCIAL',
        },
        dutiesPayment: {
          paymentType: shippingInstance?.detail?.payor?.customs === 'CONSIGNEE' ? 'RECIPIENT' : 'SENDER',
          payor: {
            responsibleParty: {
              accountNumber: { value: formattedAccountNumber },
            },
          },
        },
        customsValue: {
          amount: Number(totalProductValue.toFixed(2)),
          currency: shippingInstance.content.currency || 'USD',
        },
        commodities: shippingInstance.content?.products?.map((product: ShippingTypes.IProduct) => ({
          description: product.name || 'Product',
          countryOfManufacture: 'TR',
          quantity: product.piece || 1,
          quantityUnits: 'PCS',
          unitPrice: {
            amount: Number((product.unitPrice || 0).toFixed(2)),
            currency: shippingInstance.content.currency || 'USD',
          },
          customsValue: {
            amount: Number(((product.unitPrice || 0) * (product.piece || 0)).toFixed(2)),
            currency: shippingInstance.content.currency || 'USD',
          },
          weight: {
            units: 'KG',
            value: weightPerProduct,
          },
        })),
      },
      labelSpecification: {
        imageType: 'PDF',
        labelStockType: 'PAPER_4X6',
      },
      requestedPackageLineItems: [
        {
          weight: {
            units: 'KG',
            value: Number(shippingInstance.package.weight.toFixed(2)),
          },
          dimensions: {
            length: Math.ceil(shippingInstance.package.length),
            width: Math.ceil(shippingInstance.package.width),
            height: Math.ceil(shippingInstance.package.height),
            units: 'CM',
          },
        },
      ],
    },
  };

  const shipmentRes = await fetch(`${BASE_URL}/ship/v1/shipments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!shipmentRes.ok) {
    const errorData = await shipmentRes.json();
    console.error('FEDEX ERROR DETAIL:', JSON.stringify(errorData, null, 2));
    throw new Error(`${SHIPMENT_FAILED}: ${JSON.stringify(errorData.errors)}`);
  }

  const shipmentData = await shipmentRes.json();
  const output = shipmentData?.output?.transactionShipments?.[0];
  const trackingNumber = output?.pieceResponses?.[0]?.trackingNumber;
  const label = output?.pieceResponses?.[0]?.packageDocuments?.[0]?.encodedLabel;

  if (!trackingNumber) throw new Error(TRACKING_NUMBER_NOT_FOUND);

  return { trackingNumber, label };
};

export default createFedexLabel;
