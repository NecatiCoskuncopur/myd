import { carrierMessages } from '@/constants';
import { Storage } from '@/lib/storage';

const { AUTH_FAILED, SHIPMENT_FAILED, TRACKING_NUMBER_NOT_FOUND } = carrierMessages;

const BASE_URL = 'https://www.sandbox.ups.com';

const createUpsPaper = async ({
  shippingInstance,
  accountNumber,
  credentials,
  shippingId,
}: CarrierTypes.ICreateUpsPaper): Promise<{
  trackingNumber: string;
  label: string;
  invoice: string;
}> => {
  const authRes = await fetch(`${BASE_URL}/api/oauth/v1/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Base64 ${Buffer.from(`${credentials.apiKey}:${credentials.secretKey}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
    }),
  });

  if (!authRes.ok) throw new Error(AUTH_FAILED);

  const authData = await authRes.json();
  const accessToken = authData.access_token;
  const formattedAccountNumber = String(accountNumber).trim();
  const totalProductValue = shippingInstance.content.products.reduce((acc, p) => acc + p.unitPrice * p.piece, 0);
  const currency = shippingInstance.content.currency || 'USD';

  const payload = {
    ShipmentRequest: {
      Request: {
        RequestOption: 'nonvalidate',
      },
      Shipment: {
        Description: 'International Shipment',
        ShipmentRatingOptions: {
          UserLevelDiscountIndicator: 'Y',
        },
        Shipper: {
          Name: shippingInstance.sender.name.substring(0, 35),
          AttentionName: shippingInstance.sender.name.substring(0, 35),
          Phone: {
            Number: shippingInstance.sender.phone.replace(/\D/g, ''),
          },
          ShipperNumber: formattedAccountNumber,
          Address: {
            AddressLine: [shippingInstance.sender.address.line1.substring(0, 35), (shippingInstance.sender.address.line2 || '').substring(0, 35)].filter(
              Boolean,
            ),
            City: shippingInstance.sender.address.city,
            PostalCode: shippingInstance.sender.address.postalCode,
            CountryCode: 'TR',
          },
        },
        ShipTo: {
          Name: shippingInstance.consignee.name.substring(0, 35),
          AttentionName: shippingInstance.consignee.name.substring(0, 35),
          Phone: {
            Number: shippingInstance.consignee.phone,
          },
          Address: {
            AddressLine: [shippingInstance.consignee.address.line1.substring(0, 35), (shippingInstance.consignee.address.line2 || '').substring(0, 35)].filter(
              Boolean,
            ),
            City: shippingInstance.consignee.address.city,
            StateProvinceCode: shippingInstance.consignee.address.state || '',
            PostalCode: shippingInstance.consignee.address.postalCode.replace(/\s/g, ''),
            CountryCode: shippingInstance.consignee.address.country,
          },
        },
        PaymentInformation: {
          ShipmentCharge: {
            Type: '01', // Transportation Charges
            BillShipper: {
              AccountNumber: formattedAccountNumber,
            },
          },
        },
        Service: {
          Code: '65',
          Description: 'UPS Worldwide Express Saver',
        },

        ShipmentServiceOptions: {
          InternationalForms: {
            FormType: ['01'], // 01 = Commercial Invoice
            UserSelectedFormType: '01',
            InvoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
            InvoiceDate: new Date().toISOString().split('T')[0].replace(/-/g, ''),
            ReasonForExport: shippingInstance.detail.purpose || 'COMMERCIAL',
            CurrencyCode: currency,
            Product: shippingInstance.content?.products?.map((product: any) => ({
              Description: (product.name || 'Sample').substring(0, 35),
              Unit: {
                Number: String(product.piece || 1),
                Value: String(product.unitPrice || 0),
                UnitOfMeasurement: {
                  Code: 'PCS',
                },
              },
              OriginCountryCode: 'TR',
            })),
          },
        },
        Package: [
          {
            Packaging: {
              Code: '02', // Customer Box
              Description: 'Customer Box',
            },
            Dimensions: {
              UnitOfMeasurement: { Code: 'CM' },
              Length: String(Math.ceil(shippingInstance.package.length || 10)),
              Width: String(Math.ceil(shippingInstance.package.width || 10)),
              Height: String(Math.ceil(shippingInstance.package.height || 10)),
            },
            PackageWeight: {
              UnitOfMeasurement: { Code: 'KGS' },
              Weight: String(Number(shippingInstance.package.weight.toFixed(2))),
            },
          },
        ],
      },
      LabelSpecification: {
        LabelImageFormat: {
          Code: 'GIF',
        },
        LabelStockSize: {
          Height: '6',
          Width: '4',
        },
      },
    },
  };

  const shipmentRes = await fetch(`${BASE_URL}/api/shipments/v1/ship`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!shipmentRes.ok) {
    const errorData = await shipmentRes.json();
    console.error('UPS ERROR DETAIL:', JSON.stringify(errorData, null, 2));
    throw new Error(`${SHIPMENT_FAILED}: ${JSON.stringify(errorData.response?.errors || errorData)}`);
  }

  const shipmentData = await shipmentRes.json();
  const shipmentResults = shipmentData?.ShipmentResponse?.ShipmentResults;
  const trackingNumber = shipmentResults?.ShipmentIdentificationNumber;

  if (!trackingNumber) throw new Error(TRACKING_NUMBER_NOT_FOUND);
  const packageResult = shipmentResults?.PackageResults?.[0] || shipmentResults?.PackageResults;
  const label = packageResult?.ShippingLabel?.GraphicImage || '';

  if (label) {
    try {
      await Storage.putObject({
        Bucket: 'labels',
        Key: `${shippingId}.pdf`,
        Body: Buffer.from(label, 'base64'),
      });
      console.log(`[Storage] UPS Barkodu (${shippingId}.pdf) başarıyla kaydedildi.`);
    } catch (err) {
      console.error('[Storage Error] UPS barkodu yazılırken hata çıktı:', err);
      throw err;
    }
  }

  const invoiceObj = shipmentResults?.Form?.Image;
  const invoice = invoiceObj?.GraphicImage || '';

  if (invoice) {
    try {
      await Storage.putObject({
        Bucket: 'invoices',
        Key: `${shippingId}.pdf`,
        Body: Buffer.from(invoice, 'base64'),
      });
      console.log(`[Storage] UPS Faturası (${shippingId}.pdf) başarıyla kaydedildi.`);
    } catch (err) {
      console.error('[Storage Error] UPS faturası yazılırken hata çıktı:', err);
    }
  }

  return { trackingNumber, label, invoice };
};

export default createUpsPaper;
