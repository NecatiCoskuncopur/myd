import * as Sentry from '@sentry/nextjs';
import latinize from 'latinize';
import moment from 'moment';

import saveShippingDocument from '@/app/actions/shippingDocument/saveShippingDocument';
import { carrierMessages } from '@/constants';
import mergePdfLabels from '@/lib/mergedPdfLabels';
import { CarrierTypes } from '@/types/carrier';
import { CarrierAccountTypes } from '@/types/carrierAccount';
import { ShippingTypes } from '@/types/shipping';
const { AUTH_FAILED, SHIPMENT_FAILED, TRACKING_NUMBER_NOT_FOUND } = carrierMessages;

const BASE_URL = 'https://www.sandbox.ups.com';

const createUpsPaper = async ({
  shippingInstance,
  hasCustomInfo,
  customInfo,
  accountNumber,
  credentials,
  shippingId,
}: CarrierTypes.ICreatePaper): Promise<{
  trackingNumber: string;
  label: string;
  invoice: string;
}> => {
  const authRes = await fetch(`${BASE_URL}/api/oauth/v1/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Base64 ${Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
    }),
  });

  if (!authRes.ok) throw new Error(AUTH_FAILED);

  const authData = await authRes.json();
  const accessToken = authData.access_token;
  const { content, consignee, detail, sender, package: pkg } = shippingInstance;

  const shipperData = {
    name: latinize(hasCustomInfo && customInfo ? customInfo.company : sender.nickname || sender.name),
    attentionName: latinize(hasCustomInfo && customInfo ? `${customInfo.firstName} ${customInfo.lastName}` : sender.nickname || sender.name),
    phoneNumber: hasCustomInfo && customInfo ? customInfo.phone : sender.phone,
    email: hasCustomInfo && customInfo ? customInfo.email : sender.email,
    addressLine: [
      latinize(hasCustomInfo && customInfo ? customInfo?.address?.line1 : sender.address.line1),
      latinize(hasCustomInfo && customInfo ? customInfo?.address?.line2 : sender.address.line2),
    ].filter(Boolean),
    city: latinize(hasCustomInfo && customInfo ? customInfo?.address?.city : sender.address.city),
    postalCode: hasCustomInfo && customInfo ? customInfo?.address?.postalCode : sender.address.postalCode,
    countryCode: 'TR',
  };

  const recipientData = {
    name: latinize(consignee.company || consignee.name),
    attentionName: latinize(consignee.name),
    phoneNumber: consignee.phone ? String(consignee.phone).replace('-', '') : '11111111111',
    email: consignee.email,
    taxId: consignee.taxId,
    addressLine: [latinize(consignee.address.line1), latinize(consignee.address.line2)].filter(Boolean),
    city: latinize(consignee.address.city),
    postalCode: consignee.address.postalCode.split('-')[0],
    state: consignee.address.state,
    countryCode: consignee.address.country,
  };

  const payload = {
    ShipmentRequest: {
      Shipment: {
        Description: content.description ? latinize(content.description) : latinize(content.products[0].name),
        Shipper: {
          Name: shipperData.name,
          AttentionName: shipperData.attentionName,
          Phone: {
            Number: shipperData.phoneNumber,
          },
          EMailAddress: shipperData.email,
          ShipperNumber: accountNumber,
          Address: {
            AddressLine: shipperData.addressLine,
            City: shipperData.city,
            PostalCode: shipperData.postalCode,
            CountryCode: shipperData.countryCode,
          },
          VendorInfo: {
            VendorCollectIDTypeCode: '0356',
            VendorCollectIDNumber: 'IMDEU1234567',
          },
        },
        ShipTo: {
          Name: recipientData.name,
          AttentionName: recipientData.attentionName,
          Phone: {
            Number: recipientData.phoneNumber,
          },
          EMailAddress: recipientData.email,
          TaxIdentificationNumber: recipientData.taxId,
          Address: {
            AddressLine: recipientData.addressLine,
            City: recipientData.city,
            StateProvinceCode: recipientData.state,
            PostalCode: recipientData.postalCode,
            CountryCode: recipientData.countryCode,
          },
        },
        PaymentInformation: {
          ShipmentCharge: [
            {
              Type: '01',
              BillShipper: {
                AccountNumber: accountNumber,
              },
            },
          ],
        },
        Service: {
          Code: '65',
        },
        ShipmentServiceOptions: {
          InternationalForms: {
            FormType: '01',
            InvoiceDate: moment().add(1, 'days').format('YYYYMMDD'),
            ReasonForExport: (() => {
              switch (detail.purpose) {
                case 'COMMERICAL':
                  return 'SALE';
                case 'PERSONAL':
                  return 'GIFT';
                case 'REPAIR_OR_RETURN':
                  return 'RETURN';
                default:
                  return detail.purpose;
              }
            })(),
            CurrencyCode: content.currency,
            FreightCharges: {
              MonetaryValue: content.freight ? content.freight.toString() : '0',
            },
            Contacts: {
              SoldTo: {
                Name: latinize(consignee.company) || latinize(consignee.name),
                AttentionName: latinize(consignee.name),
                Phone: {
                  Number: consignee.phone ? consignee.phone : '11111111111',
                },
                EMailAddress: consignee.email,
                TaxIdentificationNumber: consignee.taxId,
                Address: {
                  AddressLine: [latinize(consignee.address.line1), latinize(consignee.address.line2)],
                  City: latinize(consignee.address.city),
                  StateProvinceCode: consignee.address.state,
                  PostalCode: consignee.address.postalCode.split('-')[0],
                  CountryCode: consignee.address.country,
                },
              },
            },
            Product: content.products.map((product: ShippingTypes.IProduct) => ({
              Description: latinize(product.name),
              Unit: {
                Number: String(product.piece),
                UnitOfMeasurement: {
                  Code: 'PC',
                },
                Value: String(product.unitPrice),
              },
              CommodityCode: product.gtip,
              OriginCountryCode: 'TR',
            })),
          },
        },
        Package: [...new Array(pkg.numberOfPackage)].map(() => ({
          Packaging: {
            Code: '02',
          },
          PackageWeight: {
            UnitOfMeasurement: {
              Code: 'KGS',
            },
            Weight: String(pkg.weight),
          },
          PackageServiceOptions:
            content.insurance > 0
              ? {
                  DeclaredValue: {
                    CurrencyCode: content.currency,
                    MonetaryValue: String(content.insurance),
                  },
                }
              : undefined,
        })),
      },
      LabelSpecification: {
        LabelImageFormat: {
          Code: 'PDF',
        },
      },
    },
  };

  if (detail.payor.customs === 'SENDER') {
    payload.ShipmentRequest.Shipment.PaymentInformation.ShipmentCharge.push({
      Type: '02',
      BillShipper: {
        AccountNumber: accountNumber,
      },
    });
  }

  const shipmentRes = await fetch(`${BASE_URL}/api/shipments/v1/ship`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!shipmentRes.ok) {
    const responseText = await shipmentRes.text();
    let errorData: CarrierAccountTypes.ICarrierErrorResponse | string;
    try {
      errorData = JSON.parse(responseText) as CarrierAccountTypes.ICarrierErrorResponse;
    } catch {
      errorData = responseText;
    }
    const error = new Error(
      `${SHIPMENT_FAILED}: HTTP ${shipmentRes.status} - ${typeof errorData === 'string' ? errorData : JSON.stringify(errorData.errors || errorData)}`,
    );

    Sentry.captureException(error, {
      extra: {
        senderName: shipperData.name,
        senderEmail: shipperData.email,
        upsError: typeof errorData === 'string' ? errorData : errorData.errors || errorData,
        responseStatus: shipmentRes.status,
        responseBody: errorData,
      },
    });

    throw error;
  }

  const shipmentData = await shipmentRes.json();
  const shipmentResults = shipmentData?.ShipmentResponse?.ShipmentResults;

  const trackingNumber = shipmentResults?.ShipmentIdentificationNumber;
  if (!trackingNumber) {
    throw new Error(TRACKING_NUMBER_NOT_FOUND);
  }

  const packageResults = Array.isArray(shipmentResults?.PackageResults)
    ? shipmentResults.PackageResults
    : shipmentResults?.PackageResults
      ? [shipmentResults.PackageResults]
      : [];

  const packageLabels: string[] = [];

  for (const [index, packageResult] of packageResults.entries()) {
    const labelImage = packageResult?.ShippingLabel?.GraphicImage;

    if (!labelImage) {
      const error = new Error(`UPS Package ${index + 1}: LABEL bulunamadı.`);

      Sentry.captureException(error, {
        extra: {
          packageIndex: index + 1,
          trackingNumber,
        },
      });

      continue;
    }

    packageLabels.push(labelImage);
  }

  if (!packageLabels.length) {
    throw new Error(`${SHIPMENT_FAILED}: No UPS labels found.`);
  }

  const label = await mergePdfLabels(packageLabels);

  if (!label.length) {
    throw new Error(`${SHIPMENT_FAILED}: No UPS labels found.`);
  }

  const invoiceImage = shipmentResults?.Form?.Image?.GraphicImage;

  const invoice = invoiceImage ? Buffer.from(invoiceImage, 'base64') : undefined;

  const saveDocumentResult = await saveShippingDocument({
    shippingId,
    label,
    ...(invoice ? { invoice } : {}),
  });

  if (saveDocumentResult.status === 'ERROR') {
    throw new Error(saveDocumentResult.message);
  }

  return {
    trackingNumber,
    label: label.toString('base64'),
    invoice: invoice ? invoice.toString('base64') : '',
  };
};

export default createUpsPaper;
