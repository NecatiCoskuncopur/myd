import { carrierMessages } from '@/constants';
import { Storage } from '@/lib/storage';
import { ShippingTypes } from '@/types/shipping';
import { CarrierTypes } from '@/types/carrier';
import latinize from 'latinize';
const { AUTH_FAILED, SHIPMENT_FAILED, TRACKING_NUMBER_NOT_FOUND } = carrierMessages;

const BASE_URL = 'https://apis-sandbox.fedex.com';

const createFedexPaper = async ({
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
  const { sender, consignee, detail, content, package: pkg } = shippingInstance;
  const authData = await authRes.json();
  const accessToken = authData.access_token;
  const totalValue = content.products.reduce((sum: number, { unitPrice, piece }: ShippingTypes.IProduct) => sum + unitPrice * piece, 0);
  const productDesc = content.description || latinize(content.products.map((p: ShippingTypes.IProduct) => p.name).toString());

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
    streetLines: [latinize(consignee.address.line1), latinize(consignee.address.line2)].filter(Boolean),
    city: latinize(consignee.address.city),
    stateOrProvinceCode: consignee.address.state,
    postalCode: String(consignee.address.postalCode).split('-')[0],
    countryCode: consignee.address.country,
    residential: false,
  };

  const payload = {
    labelResponseOptions: 'LABEL',
    accountNumber: {
      value: accountNumber,
    },
    requestedShipment: {
      shipDatestamp: new Date(Date.now() + 86_400_000).toISOString().split('T')[0],
      pickupType: 'DROPOFF_AT_FEDEX_LOCATION',
      serviceType: 'FEDEX_INTERNATIONAL_PRIORITY',
      packagingType: 'FEDEX_PAK',
      totalWeight: pkg.weight * pkg.numberOfPackage,
      preferredCurrency: content.currency,
      shipper: {
        accountNumber: { value: accountNumber },
        ...(detail.iossNumber && {
          tins: [{ tinType: 'BUSINESS_UNION', number: detail.iossNumber }],
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
            accountNumber: { value: accountNumber },
          },
        },
      },

      shipmentSpecialServices: {
        specialServiceTypes: ['ELECTRONIC_TRADE_DOCUMENTS', ...(content.insurance > 0 ? ['INSURED_VALUE'] : [])],
        etdDetail: {
          attributes: ['POST_SHIPMENT_UPLOAD_REQUESTED'],
        },
      },

      customsClearanceDetail: {
        dutiesPayment: {
          paymentType: 'SENDER',
          payor: {
            responsibleParty: {
              accountNumber: {
                value: accountNumber,
              },
            },
          },
        },

        customsValue: { currency: content.currency, amount: totalValue },
        partiesToTransactionAreRelated: false,

        commercialInvoice: {
          comments: [productDesc],
          ...(content.freight && {
            freightCharge: { currency: content.currency, amount: content.freight },
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
          weight: { units: 'KG', value: 0.001 },
          quantity: product.piece,
          quantityUnits: 'PCS',
          unitPrice: { currency: content.currency, amount: product.unitPrice },
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
            { type: 'LETTER_HEAD', id: 'IMAGE_2' },
            { type: 'SIGNATURE', id: 'IMAGE_1' },
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
    const errorData = await shipmentRes.json();
    console.error('FEDEX ERROR DETAIL:', JSON.stringify(errorData, null, 2));
    throw new Error(`${SHIPMENT_FAILED}: ${JSON.stringify(errorData.errors)}`);
  }

  const shipmentData = await shipmentRes.json();
  const output = shipmentData?.output?.transactionShipments?.[0];
  const trackingNumber = output?.pieceResponses?.[0]?.trackingNumber;

  if (!trackingNumber) throw new Error(TRACKING_NUMBER_NOT_FOUND);

  const documents = output?.pieceResponses?.[0]?.packageDocuments || [];
  const labelObj = documents.find((doc: CarrierTypes.FedexPackageDocument) => doc.contentType?.includes('LABEL') || doc.documentType?.includes('LABEL'));
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
