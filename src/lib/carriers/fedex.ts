import { carrierMessages } from '@/constants';
import { Storage } from '@/lib/storage';

const { AUTH_FAILED, SHIPMENT_FAILED, TRACKING_NUMBER_NOT_FOUND } = carrierMessages;

const BASE_URL = 'https://apis-sandbox.fedex.com';

const splitAddress = (addressStr: string): string[] => {
  if (!addressStr) return ['Missing Address'];
  const chunks = addressStr.match(/.{1,35}/g) || [];
  return chunks.slice(0, 3);
};

const createFedexPaper = async ({
  shippingInstance,
  accountNumber,
  credentials,
  shippingId,
}: CarrierTypes.ICreateFedexPaper): Promise<{
  trackingNumber: string;
  label: string;
  invoice: string;
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

  let weightPerProduct = Number((shippingInstance.package.weight / productCount).toFixed(2));
  if (weightPerProduct <= 0) weightPerProduct = 0.01;

  const todayStr = new Date().toISOString().split('T')[0];

  const payload = {
    labelResponseOptions: 'LABEL',
    accountNumber: {
      value: formattedAccountNumber,
    },
    requestedShipment: {
      shipDatestamp: todayStr,
      pickupType: 'USE_SCHEDULED_PICKUP',
      serviceType: 'INTERNATIONAL_PRIORITY',
      packagingType: 'YOUR_PACKAGING',
      shipper: {
        contact: {
          personName: shippingInstance.sender.name,
          phoneNumber: shippingInstance.sender.phone,
        },
        address: {
          streetLines: splitAddress(`${shippingInstance.sender.address.line1} ${shippingInstance.sender.address.line2 || ''}`.trim()),
          city: shippingInstance.sender.address.city,
          postalCode: shippingInstance.sender.address.postalCode,
          countryCode: 'TR',
        },
      },
      recipients: [
        {
          contact: {
            personName: shippingInstance.consignee.name,
            phoneNumber: shippingInstance.consignee.phone,
          },
          address: {
            streetLines: splitAddress(`${shippingInstance.consignee.address.line1} ${shippingInstance.consignee.address.line2 || ''}`.trim()),
            city: shippingInstance.consignee.address.city,
            ...(['US', 'CA', 'IN'].includes(shippingInstance.consignee.address.country) && {
              stateOrProvinceCode: shippingInstance.consignee.address.state || 'NY',
            }),
            postalCode: shippingInstance.consignee.address.postalCode.replace(/\s/g, ''),
            countryCode: shippingInstance.consignee.address.country,
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
          invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
          invoiceDate: todayStr,
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
        commodities: shippingInstance.content?.products?.map((product: any) => {
          const cleanDescription = (product.name || '').trim();
          const safeDescription = cleanDescription.length > 2 && cleanDescription.toLowerCase() !== 'product' ? cleanDescription : 'Textile Fabric Sample';

          return {
            description: safeDescription.substring(0, 45),
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
          };
        }),
      },

      labelSpecification: {
        labelFormatType: 'COMMON2D',
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
            length: Math.ceil(shippingInstance.package.length || 10),
            width: Math.ceil(shippingInstance.package.width || 10),
            height: Math.ceil(shippingInstance.package.height || 10),
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

  if (!trackingNumber) throw new Error(TRACKING_NUMBER_NOT_FOUND);

  const documents = output?.pieceResponses?.[0]?.packageDocuments || [];
  const labelObj = documents.find((doc: any) => doc.contentType?.includes('LABEL') || doc.documentType?.includes('LABEL'));
  const label = labelObj?.encodedLabel || labelObj?.parts?.[0]?.image || '';

  if (label) {
    try {
      await Storage.putObject({
        Bucket: 'labels',
        Key: `${shippingId}.pdf`,
        Body: Buffer.from(label, 'base64'),
      });
      console.log(`[Storage] FedEx Barkodu (${shippingId}.pdf) başarıyla kaydedildi.`);
    } catch (err) {
      console.error('[Storage Error] FedEx barkodu yazılırken hata çıktı:', err);
      throw err;
    }
  }

  const invoice = '';
  return { trackingNumber, label, invoice };
};

export default createFedexPaper;
