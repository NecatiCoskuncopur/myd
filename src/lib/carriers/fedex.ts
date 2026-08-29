import * as Sentry from '@sentry/nextjs';
import latinize from 'latinize';

import saveShippingDocument from '@/app/actions/shippingDocument/saveShippingDocument';
import { CarrierAccountTypeEnum, carrierMessages } from '@/constants';
import mergePdfLabels from '@/lib/mergedPdfLabels';
import { CarrierTypes } from '@/types/carrier';
import { CarrierAccountTypes } from '@/types/carrierAccount';
import { ShippingTypes } from '@/types/shipping';
const { AUTH_FAILED, SHIPMENT_FAILED, TRACKING_NUMBER_NOT_FOUND } = carrierMessages;

const BASE_URL = 'https://apis-sandbox.fedex.com';

const createFedexPaper = async ({
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
    throw new Error(AUTH_FAILED);
  }

  const { sender, consignee, detail, content, package: pkg } = shippingInstance;
  const authData = await authRes.json();
  const accessToken = authData.access_token;
  const totalValue = content.products.reduce((sum: number, { unitPrice, piece }: ShippingTypes.IProduct) => sum + unitPrice * piece, 0);
  const productDesc = content.description || latinize(content.products.map((product: ShippingTypes.IProduct) => product.name).toString());
  const dutiesPaymentType = detail.payor?.customs === 'CONSIGNEE' ? 'RECIPIENT' : detail.payor?.customs;

  const senderContact = {
    personName: latinize(
      hasCustomInfo && customInfo ? `${customInfo.firstName} ${customInfo.lastName}` : shippingInstance.sender.nickname || shippingInstance.sender.name,
    ),
    companyName: latinize(hasCustomInfo && customInfo ? customInfo.company : sender.company || sender.name),
    phoneNumber: hasCustomInfo && customInfo ? customInfo.phone : sender.phone,
    emailAddress: hasCustomInfo && customInfo ? customInfo.email : sender.email,
  };

  const senderAddress = {
    streetLines: [
      latinize(hasCustomInfo && customInfo ? customInfo?.address?.line1 : sender.address.line1),
      latinize(hasCustomInfo && customInfo ? customInfo?.address?.line2 : sender.address.line2),
    ].filter(Boolean),
    city: latinize(hasCustomInfo && customInfo ? customInfo?.address?.city : sender.address.city),
    postalCode: hasCustomInfo && customInfo ? customInfo?.address?.postalCode : sender.address.postalCode,
    countryCode: 'TR',
    residential: false,
  };

  const consigneeContact = {
    personName: latinize(consignee.name),
    companyName: latinize(consignee.company || consignee.name),
    phoneNumber: consignee.phone ? String(`+${consignee.phone}`).replace('-', '') : '111111111111',
    emailAddress: consignee.email,
  };

  const consigneeAddress = {
    streetLines: [
      consignee.address.line1 ? latinize(consignee.address.line1) : undefined,
      consignee.address.line2 ? latinize(consignee.address.line2) : undefined,
    ].filter(Boolean),

    city: latinize(consignee.address.city),

    stateOrProvinceCode: consignee.address.state,
    postalCode: String(consignee.address.postalCode).trim(),

    countryCode: consignee.address.country,

    residential: false,
  };

  const serviceType = accountType === CarrierAccountTypeEnum.ECONOMY ? 'INTERNATIONAL_ECONOMY' : 'FEDEX_INTERNATIONAL_PRIORITY';

  const payload = {
    labelResponseOptions: 'LABEL',
    accountNumber: {
      value: accountNumber,
    },
    requestedShipment: {
      shipDatestamp: new Date(Date.now() + 86_400_000).toISOString().split('T')[0],
      pickupType: 'DROPOFF_AT_FEDEX_LOCATION',
      serviceType,
      packagingType: pkg.weight <= 5 ? 'FEDEX_PAK' : 'YOUR_PACKAGING',
      totalWeight: pkg.weight * pkg.numberOfPackage,
      preferredCurrency: content.currency,
      shipper: {
        accountNumber: {
          value: accountNumber,
        },

        ...(detail.iossNumber && {
          tins: [
            {
              tinType: 'BUSINESS_UNION',
              number: detail.iossNumber,
            },
          ],
        }),
        contact: {
          ...senderContact,
        },
        address: {
          ...senderAddress,
        },
      },
      recipients: [
        {
          contact: {
            ...consigneeContact,
          },
          address: {
            ...consigneeAddress,
          },
        },
      ],
      shippingChargesPayment: {
        paymentType: 'SENDER',
        payor: {
          responsibleParty: {
            accountNumber: {
              value: accountNumber,
            },
          },
        },
      },

      shipmentSpecialServices: {
        specialServiceTypes: ['ELECTRONIC_TRADE_DOCUMENTS'],
        etdDetail: {
          attributes: ['POST_SHIPMENT_UPLOAD_REQUESTED'],
        },
      },

      customsClearanceDetail: {
        dutiesPayment: {
          paymentType: dutiesPaymentType,

          payor: {
            responsibleParty: {
              accountNumber: {
                value: accountNumber,
              },
            },
          },
        },
        customsValue: {
          currency: content.currency,
          amount: totalValue,
        },
        partiesToTransactionAreRelated: false,

        commercialInvoice: {
          comments: [productDesc],
          ...(content.freight && {
            freightCharge: {
              currency: content.currency,
              amount: content.freight,
            },
          }),
          specialInstructions: productDesc,
          declarationStatement: productDesc,
          termsOfSale: detail.payor?.customs === 'SENDER' ? 'DDP' : undefined,
          shipmentPurpose: detail.purpose,
        },

        commodities: content.products.map((product: ShippingTypes.IProduct) => ({
          name: latinize(product.name),
          numberOfPieces: 1,
          description: latinize(product.name),
          countryOfManufacture: 'TR',
          harmonizedCode: product.gtip,
          weight: {
            units: 'KG',
            value: 0.001,
          },
          quantity: product.piece,
          quantityUnits: 'PCS',
          unitPrice: {
            currency: content.currency,
            amount: product.unitPrice,
          },
          customsValue: {
            currency: content.currency,
            amount: product.unitPrice * product.piece,
          },
        })),
      },

      labelSpecification: {
        labelFormatType: 'COMMON2D',
        imageType: 'PDF',
        labelStockType: 'STOCK_4X6',
        labelPrintingOrientation: 'TOP_EDGE_OF_TEXT_FIRST',
        labelOrder: 'SHIPPING_LABEL_FIRST',
      },

      shippingDocumentSpecification: {
        shippingDocumentTypes: ['COMMERCIAL_INVOICE'],
        commercialInvoiceDetail: {
          documentFormat: {
            dispositions: [{ dispositionType: 'RETURNED', grouping: 'INDIVIDUAL' }],
            docType: 'PDF',
            stockType: 'PAPER_LETTER',
          },
          customerImageUsages: [
            { type: 'LETTER_HEAD', providedImageType: 'LETTER_HEAD' },
            { type: 'SIGNATURE', providedImageType: 'SIGNATURE' },
          ],
        },
      },
      rateRequestTypes: ['LIST'],
      edtRequestType: 'ALL',
      packageCount: pkg.numberOfPackage,

      requestedPackageLineItems: [
        {
          sequenceNumber: 1,
          groupNumber: 1,
          groupPackageCount: pkg.numberOfPackage,
          weight: { units: 'KG', value: pkg.weight / 2 },
          dimensions: {
            length: pkg.length / 2,
            width: pkg.width / 2,
            height: pkg.height / 2,
            units: 'CM',
          },
          ...(content.insurance && {
            insuredValue: {
              currency: content.currency,
              amount: content.insuranceAmount,
            },
          }),
          customerReferences: [{ customerReferenceType: 'CUSTOMER_REFERENCE', value: 'REF06REF06' }],
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
        senderName: senderContact.personName,
        senderEmail: senderContact.emailAddress,
        fedexError: typeof errorData === 'string' ? errorData : errorData.errors || errorData,
        responseStatus: shipmentRes.status,
        responseBody: errorData,
      },
    });

    throw error;
  }

  const shipmentData = await shipmentRes.json();
  const output = shipmentData?.output?.transactionShipments?.[0];

  if (!output) {
    throw new Error(`${SHIPMENT_FAILED}: FedEx transaction shipment bulunamadı.`);
  }

  const pieceResponses = output?.pieceResponses || [];

  if (!pieceResponses.length) {
    throw new Error(TRACKING_NUMBER_NOT_FOUND);
  }

  const trackingNumber = pieceResponses[0]?.trackingNumber || output?.masterTrackingNumber;

  if (!trackingNumber) {
    throw new Error(TRACKING_NUMBER_NOT_FOUND);
  }

  const packageLabels: string[] = [];

  for (const [index, piece] of pieceResponses.entries()) {
    const documents = piece?.packageDocuments || [];

    const labelDocuments = documents.filter((doc: CarrierTypes.FedexPackageDocument) => doc.contentType === 'LABEL');

    const labelImage = labelDocuments[0]?.encodedLabel;

    if (!labelImage) {
      const error = new Error(`FedEx Package ${index + 1}: LABEL bulunamadı.`);
      Sentry.captureException(error, {
        extra: { senderName: senderContact.personName, senderEmail: senderContact.emailAddress, packageIndex: index + 1, trackingNumber },
      });
      continue;
    }

    packageLabels.push(labelImage);
  }

  if (!packageLabels.length) {
    throw new Error(`${SHIPMENT_FAILED}: No FedEx labels found.`);
  }

  const label = await mergePdfLabels(packageLabels);

  if (!label.length) {
    throw new Error(`${SHIPMENT_FAILED}: No FedEx labels found.`);
  }

  const saveLabelResult = await saveShippingDocument({
    shippingId,
    label,
  });

  if (saveLabelResult.status === 'ERROR') {
    throw new Error(saveLabelResult.message);
  }

  const invoice = '';

  return {
    trackingNumber,
    label: label.toString('base64'),
    invoice,
  };
};

export default createFedexPaper;
