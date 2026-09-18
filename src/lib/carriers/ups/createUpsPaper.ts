import * as Sentry from '@sentry/nextjs';
import latinize from 'latinize';
import moment from 'moment';

import saveShippingDocument from '@/app/actions/shippingDocument/saveShippingDocument';
import { CarrierAccountTypeEnum, carrierBaseUrl, carrierMessages } from '@/constants';
import uploadUpsDocument from '@/lib/carriers/ups/uploadUpsDocument';
import mergePdfLabels from '@/lib/mergedPdfLabels';
import { AdditionalDocument } from '@/models';
import { CarrierTypes } from '@/types/carrier';
import { ShippingTypes } from '@/types/shipping';
const { AUTH_FAILED, SHIPMENT_FAILED, TRACKING_NUMBER_NOT_FOUND } = carrierMessages;

type UpsPackageResult = {
  TrackingNumber?: string;
  ShippingLabel?: {
    GraphicImage?: string;
  };
};

type UpsShipmentResponse = {
  ShipmentResponse?: {
    ShipmentResults?: {
      ShipmentIdentificationNumber?: string;
      PackageResults?: UpsPackageResult | UpsPackageResult[];
      Form?: {
        Image?: {
          GraphicImage?: string;
        };
      };
    };
  };
};

const parseResponse = (responseText: string): unknown => {
  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
  }
};

const createUpsPaper = async ({
  shippingInstance,
  hasCustomInfo,
  customInfo,
  accountNumber,
  credentials,
  shippingId,
  accountType,
}: CarrierTypes.ICreatePaper): Promise<{
  trackingNumber: string;
  label: string;
  invoice: string;
}> => {
  const authRes = await fetch(`${carrierBaseUrl.UPS}/security/v1/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
    }),
  });

  const authResponseText = await authRes.text();
  const authResponseData = parseResponse(authResponseText);

  if (!authRes.ok) {
    const error = new Error(
      `${AUTH_FAILED}: HTTP ${authRes.status} ${authRes.statusText} - ${
        typeof authResponseData === 'string' ? authResponseData : JSON.stringify(authResponseData)
      }`,
    );

    Sentry.captureException(error, {
      tags: {
        carrier: 'UPS',
        stage: 'AUTH',
        accountNumber,
      },
      extra: {
        shippingId,
        accountNumber,
        responseStatus: authRes.status,
        responseBody: authResponseData,
      },
    });

    throw error;
  }

  if (!authResponseData || typeof authResponseData !== 'object' || !('access_token' in authResponseData)) {
    throw new Error(`${AUTH_FAILED}: UPS response içerisinde access_token bulunamadı.`);
  }

  const accessToken = String((authResponseData as Record<string, unknown>).access_token);
  const { content, consignee, detail, sender, package: pkg } = shippingInstance;
  const totalValue = Number(content.products.reduce((sum: number, { unitPrice, piece }: ShippingTypes.IProduct) => sum + unitPrice * piece, 0).toFixed(2));
  const useCustomInfo = hasCustomInfo && Boolean(customInfo);

  const rawShipperData = {
    name: useCustomInfo && customInfo ? customInfo.company : sender.nickname || sender.name,
    attentionName: useCustomInfo && customInfo ? `${customInfo.firstName} ${customInfo.lastName}` : sender.nickname || sender.name,
    phoneNumber: useCustomInfo && customInfo ? customInfo.phone : sender.phone,
    email: useCustomInfo && customInfo ? customInfo.email : sender.email,
    addressLine1: useCustomInfo && customInfo ? customInfo.address?.line1 : sender.address.line1,
    addressLine2: useCustomInfo && customInfo ? customInfo.address?.line2 : sender.address.line2,
    district: useCustomInfo && customInfo ? customInfo.address?.district : sender.address.district,
    city: useCustomInfo && customInfo ? customInfo.address?.city : sender.address.city,
    postalCode: useCustomInfo && customInfo ? customInfo.address?.postalCode : sender.address.postalCode,
    countryCode: 'TR',
  };

  const shipperData = {
    name: latinize(rawShipperData.name),
    attentionName: latinize(rawShipperData.attentionName),
    phoneNumber: rawShipperData.phoneNumber,
    email: rawShipperData.email,
    addressLine: [
      rawShipperData.addressLine1 ? latinize(rawShipperData.addressLine1) : undefined,
      rawShipperData.addressLine2 ? latinize(rawShipperData.addressLine2) : undefined,
      rawShipperData.district ? latinize(rawShipperData.district) : undefined,
    ].filter((value): value is string => Boolean(value)),
    city: rawShipperData.city ? latinize(rawShipperData.city) : '',
    postalCode: rawShipperData.postalCode,
    countryCode: rawShipperData.countryCode,
  };

  const recipientData = {
    name: latinize(consignee.company || consignee.name),
    attentionName: latinize(consignee.name),
    phoneNumber: consignee.phone ? String(consignee.phone).replace('-', '') : '11111111111',
    email: consignee.email,
    taxId: consignee.taxId,
    addressLine: [
      consignee.address.line1 ? latinize(consignee.address.line1) : undefined,
      consignee.address.line2 ? latinize(consignee.address.line2) : undefined,
    ].filter((value): value is string => Boolean(value)),
    city: consignee.address.city ? latinize(consignee.address.city) : '',
    postalCode: consignee.address.postalCode.split('-')[0],
    state: consignee.address.state,
    countryCode: consignee.address.country,
  };
  const serviceType = accountType === CarrierAccountTypeEnum.ECONOMY ? '08' : '65';
  const additionalDocuments = shippingInstance.additionalDocumentIds?.length
    ? await AdditionalDocument.find({
        _id: {
          $in: shippingInstance.additionalDocumentIds,
        },
      }).select('_id data type contentType')
    : [];

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
          Code: serviceType,
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
                Name: consignee.company ? latinize(consignee.company) : latinize(consignee.name),

                AttentionName: latinize(consignee.name),
                Phone: {
                  Number: consignee.phone ? consignee.phone : '11111111111',
                },
                EMailAddress: consignee.email,
                TaxIdentificationNumber: consignee.taxId,
                Address: {
                  AddressLine: [
                    consignee.address.line1 ? latinize(consignee.address.line1) : undefined,
                    consignee.address.line2 ? latinize(consignee.address.line2) : undefined,
                  ].filter((value): value is string => Boolean(value)),

                  City: consignee.address.city ? latinize(consignee.address.city) : '',
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
          PackageServiceOptions: content.insurance
            ? {
                DeclaredValue: {
                  CurrencyCode: content.currency,
                  MonetaryValue: String(totalValue),
                },
              }
            : undefined,
        })),
      },
      LabelSpecification: {
        LabelImageFormat: {
          Code: 'PDF',
        },
        LabelStockSize: {
          Height: '6',
          Width: '4',
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

  const shipmentRes = await fetch(`${carrierBaseUrl.UPS}/api/shipments/v1/ship`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  const shipmentResponseText = await shipmentRes.text();
  const shipmentResponseData = parseResponse(shipmentResponseText);

  if (!shipmentRes.ok) {
    const errorData = shipmentResponseData as
      | {
          response?: {
            errors?: Array<{
              code?: string;
              message?: string;
            }>;
          };
        }
      | string;

    const errorMessage =
      typeof errorData === 'string'
        ? errorData
        : errorData.response?.errors
            ?.map(error => error.message || error.code)
            .filter(Boolean)
            .join(' ') || SHIPMENT_FAILED;

    const error = new Error(errorMessage);

    Sentry.captureException(error, {
      tags: {
        carrier: 'UPS',
        stage: 'CREATE_SHIPMENT',
        accountNumber,
      },

      extra: {
        shippingId,
        accountNumber,
        accountType,
        serviceType,

        hasCustomInfo,
        customInfoExists: Boolean(customInfo),

        shipperData,
        recipientData,

        responseStatus: shipmentRes.status,
        responseBody: errorData,
      },
    });

    throw error;
  }

  const shipmentData = shipmentResponseData as UpsShipmentResponse;
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
          accountNumber,
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

    ...(invoice
      ? {
          invoice,
        }
      : {}),
  });

  if (saveDocumentResult.status === 'ERROR') {
    throw new Error(saveDocumentResult.message);
  }
  const trackingNumbers = packageResults
    .map((packageResult: UpsPackageResult) => packageResult?.TrackingNumber)
    .filter((value: string | undefined): value is string => Boolean(value));

  for (const additionalDocument of additionalDocuments) {
    try {
      await uploadUpsDocument({
        accessToken,
        accountNumber,
        shipmentIdentifier: trackingNumber,
        trackingNumbers: trackingNumbers.length ? trackingNumbers : [trackingNumber],
        document: Buffer.from(additionalDocument.data),
        type: additionalDocument.type,
        contentType: additionalDocument.contentType,
      });
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          carrier: 'UPS',
          operation: 'DOCUMENT_UPLOAD',
        },
        extra: {
          shippingId,
          trackingNumber,
          additionalDocumentId: additionalDocument._id.toString(),
          additionalDocumentType: additionalDocument.type,
          documentUploadFailed: true,
        },
      });
    }
  }

  return {
    trackingNumber,
    label: label.toString('base64'),
    invoice: invoice ? invoice.toString('base64') : '',
  };
};

export default createUpsPaper;
