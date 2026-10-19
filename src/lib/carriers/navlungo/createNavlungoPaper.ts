import * as Sentry from '@sentry/nextjs';
import { randomUUID } from 'crypto';

import saveShippingDocument from '@/app/actions/shippingDocument/saveShippingDocument';
import { CarrierAccountTypeEnum, carrierBaseUrl, carrierMessages } from '@/constants';
import formatHsCode from '@/lib/formatHsCode';
import { AdditionalDocument } from '@/models';
import { CarrierTypes } from '@/types/carrier';
import { ShippingTypes } from '@/types/shipping';

const { AUTH_FAILED, SHIPMENT_FAILED, TRACKING_NUMBER_NOT_FOUND } = carrierMessages;

type NavlungoShipmentType = 'sales' | 'sample' | 'micro-export' | 'gift';

interface NavlungoTokenResponse {
  access_token: string;
}

interface NavlungoStore {
  storeId: string;
  name: string;
}

interface NavlungoAdditionalService {
  serviceCode: string;
  priceAmount: number;
  currency: string;
  isRequired: boolean;
}

interface NavlungoQuote {
  quoteReference: string;
  price: number;
  currency: string;
  serviceType: string;
  carrier: string;
  additionalServices: NavlungoAdditionalService[];
}

interface NavlungoOrderQuoteResponse {
  searchId: string;
  quotes?: NavlungoQuote[];
}

interface NavlungoShipOrderResponse {
  shipmentId: string;
  shipmentReference: string;
  cargoLabels?: string[];
}

interface NavlungoLabelResponse {
  lastMileTrackingNumber: string;
}

interface NavlungoLabelDownloadResponse {
  labelUrl: string;
}

const getShipmentType = (purpose: unknown): NavlungoShipmentType => {
  const normalizedPurpose = String(purpose).trim().toLowerCase().replace(/_/g, '-');
  if (normalizedPurpose.includes('gift')) return 'gift';
  if (normalizedPurpose.includes('sample')) return 'sample';
  if (normalizedPurpose.includes('sale') || normalizedPurpose.includes('commercial')) return 'sales';
  return 'micro-export';
};

const selectNavlungoQuote = (
  quotes: NavlungoQuote[],
  accountType: CarrierAccountTypeEnum,
  shippingInstance: ShippingTypes.IShipping,
  navlungoFirm?: string,
): NavlungoQuote => {
  const validQuotes = quotes.filter(quote => quote.quoteReference && Number.isFinite(Number(quote.price)));

  if (!validQuotes.length) {
    throw new Error(`${SHIPMENT_FAILED}: Geçerli Navlungo teklifi bulunamadı.`);
  }

  let filteredQuotes = validQuotes;
  if (navlungoFirm) {
    filteredQuotes = validQuotes.filter(quote => quote.carrier.toLowerCase() === navlungoFirm.toLowerCase());
  }

  const isEconomy = accountType === CarrierAccountTypeEnum.ECONOMY;
  const matchingQuotes = filteredQuotes.filter(quote => {
    const serviceType = quote.serviceType.toLowerCase();
    if (navlungoFirm?.toUpperCase() === 'THY') {
      return isEconomy;
    }

    const targetServiceType = isEconomy ? 'expedited' : 'express';

    return serviceType.includes(targetServiceType);
  });

  const isSenderPayor = shippingInstance.detail.payor?.customs === 'SENDER';
  const hasInsuranceRequested = Boolean(shippingInstance.content.insurance);

  const finalQuotes = matchingQuotes.filter(quote => {
    const additionalServices = quote.additionalServices ?? [];

    for (const service of additionalServices) {
      if (service.isRequired) {
        if (service.serviceCode === 'ddp' && !isSenderPayor) {
          return false;
        }
        if (service.serviceCode === 'insurance' && !hasInsuranceRequested) {
          return false;
        }
      }
    }
    return true;
  });

  if (!finalQuotes.length) {
    throw new Error(`${SHIPMENT_FAILED}: Kullanıcı tercihlerine uygun Navlungo teklifi bulunamadı (Zorunlu hizmet uyuşmazlığı).`);
  }

  return [...finalQuotes].sort((a, b) => Number(a.price) - Number(b.price))[0];
};

const getSelectedAdditionalServices = (quote: NavlungoQuote, shippingInstance: ShippingTypes.IShipping): string[] => {
  const selected = new Set<string>();

  const isSenderPayor = shippingInstance.detail.payor?.customs === 'SENDER';
  const hasInsuranceRequested = Boolean(shippingInstance.content.insurance);

  for (const service of quote.additionalServices ?? []) {
    if (service.serviceCode === 'ddp' && isSenderPayor) {
      selected.add('ddp');
    }
    if (service.serviceCode === 'insurance' && hasInsuranceRequested) {
      selected.add('insurance');
    }
    if (service.isRequired && service.serviceCode !== 'ddp' && service.serviceCode !== 'insurance') {
      selected.add(service.serviceCode);
    }
  }

  return [...selected];
};

const createNavlungoPaper = async ({
  shippingInstance,
  credentials,
  shippingId,
  accountType,
  accountNumber,
  navlungoFirm,
}: CarrierTypes.ICreatePaper): Promise<{
  trackingNumber: string;
  label: string;
  invoice: string;
  carrierShipmentId: string;
  documentUploadErrors?: { documentId: string; message: string }[];
}> => {
  const { sender, consignee, detail, content, package: pkg } = shippingInstance;

  const authRes = await fetch(`${carrierBaseUrl.NAVLUNGO}/v1/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      grant_type: 'refresh_token',
      refresh_token: accountNumber,
    }),
  });

  if (!authRes.ok) throw new Error(AUTH_FAILED);

  const { access_token: accessToken } = (await authRes.json()) as NavlungoTokenResponse;
  if (!accessToken) throw new Error(AUTH_FAILED);

  const storesRes = await fetch(`${carrierBaseUrl.NAVLUNGO}/stores/v1`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!storesRes.ok) throw new Error(`${SHIPMENT_FAILED}: Navlungo mağazaları alınamadı.`);

  const stores = (await storesRes.json()) as NavlungoStore[];
  if (!stores.length) throw new Error(`${SHIPMENT_FAILED}: Navlungo hesabında mağaza bulunamadı.`);
  const store = stores[0];

  const uniqueOrderReference = `${shippingId}-${randomUUID().slice(0, 8)}`;
  const destinationCountry = consignee.address.country;

  const quotePayload = {
    order: {
      orderReference: uniqueOrderReference,
      currencyCode: String(content.currency),
      receiverAddress: {
        contactName: consignee.company || consignee.name,
        countryCode: destinationCountry.toUpperCase(),
        ...(consignee.address.state && { state: consignee.address.state }),
        town: consignee.address.city,
        city: consignee.address.city,
        postalCode: String(consignee.address.postalCode).trim(),
        firstLine: [consignee.address.line1, consignee.address.line2].filter(Boolean).join(' ').trim(),
      },
      ...(consignee.email && { receiverEmail: consignee.email }),
      receiverPhoneNumber: consignee.phone,
      orderItems: content.products.map((product: ShippingTypes.IProduct, index: number) => ({
        quantity: product.piece,
        price: String(product.unitPrice),
        description: product.name,
        sku: `${shippingId}-${index + 1}`,
        hsCode: formatHsCode(product.gtip!, destinationCountry),
        originCountryCode: 'TR',
      })),
    },
    packages: [
      {
        quantity: pkg.numberOfPackage,
        type: 'box',
        weight: pkg.weight,
        width: pkg.width,
        length: pkg.length,
        height: pkg.height,
      },
    ],
    shipmentType: getShipmentType(detail.purpose),
  };

  const quoteRes = await fetch(`${carrierBaseUrl.NAVLUNGO}/stores/v2/${store.storeId}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(quotePayload),
  });

  if (!quoteRes.ok) {
    const errorText = await quoteRes.text();
    throw new Error(`${SHIPMENT_FAILED}: Teklif oluşturulamadı. Detay: ${errorText}`);
  }

  const quoteData = (await quoteRes.json()) as NavlungoOrderQuoteResponse;
  if (!quoteData.quotes?.length) throw new Error(`${SHIPMENT_FAILED}: Uygun taşıma teklifi bulunamadı.`);
  const quote = selectNavlungoQuote(quoteData.quotes, accountType, shippingInstance, navlungoFirm);
  const selectedAdditionalServices = getSelectedAdditionalServices(quote, shippingInstance);

  const shipmentRes = await fetch(`${carrierBaseUrl.NAVLUNGO}/stores/v2/${store.storeId}/orders/${uniqueOrderReference}/ship`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({
      quoteReference: quote.quoteReference,
      searchId: quoteData.searchId,
      selectedAdditionalServices,
    }),
  });

  if (!shipmentRes.ok) {
    const errorText = await shipmentRes.text();
    const error = new Error(`${SHIPMENT_FAILED}: Sevkiyat oluşturulamadı. Detay: ${errorText}`);

    Sentry.captureException(error, {
      extra: {
        shippingId,
        senderName: sender.name,
        senderEmail: sender.email,
        carrier: 'NAVLUNGO',
        responseStatus: shipmentRes.status,
        responseBody: errorText,
      },
    });
    throw error;
  }

  const shipmentData = (await shipmentRes.json()) as NavlungoShipOrderResponse;
  if (!shipmentData.shipmentId) throw new Error(`${SHIPMENT_FAILED}: Navlungo shipmentId bulunamadı.`);

  let trackingNumber = String(shipmentData.shipmentReference);

  const earlyTrackRes = await fetch(`${carrierBaseUrl.NAVLUNGO}/api/shipments/v1/${shipmentData.shipmentId}/label`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  }).catch(() => null);

  if (earlyTrackRes?.ok) {
    const trackData = (await earlyTrackRes.json().catch(() => null)) as NavlungoLabelResponse | null;
    if (trackData?.lastMileTrackingNumber) {
      trackingNumber = trackData.lastMileTrackingNumber;
    }
  }

  if (!trackingNumber || trackingNumber === 'undefined') {
    throw new Error(TRACKING_NUMBER_NOT_FOUND);
  }

  const labelRes = await fetch(`${carrierBaseUrl.NAVLUNGO}/api/shipments/v1/${shipmentData.shipmentId}/label`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!labelRes.ok) {
    const errorText = await labelRes.text();
    const errorMessage = `${SHIPMENT_FAILED}: Navlungo'dan etiket bilgisi alınamadı. Detay: ${errorText}`;
    const error = new Error(errorMessage);

    Sentry.captureException(error, {
      extra: {
        shippingId,
        carrierShipmentId: shipmentData.shipmentId,
        statusCode: labelRes.status,
        errorText,
      },
    });

    throw new Error(`${SHIPMENT_FAILED}: Navlungo'dan etiket bilgisi alınamadı. Detay: ${errorText}`);
  }

  const labelData = (await labelRes.json()) as NavlungoLabelDownloadResponse;

  if (!labelData?.labelUrl) {
    throw new Error(`${SHIPMENT_FAILED}: Navlungo yanıtında etiket URL'i bulunamadı.`);
  }

  const labelPdfRes = await fetch(labelData.labelUrl);

  if (!labelPdfRes.ok) {
    throw new Error(`${SHIPMENT_FAILED}: Etiket PDF'i indirilemedi (HTTP ${labelPdfRes.status}).`);
  }

  const labelBuffer = Buffer.from(await labelPdfRes.arrayBuffer());

  const saveLabelResult = await saveShippingDocument({
    shippingId,
    label: labelBuffer,
  });

  if (saveLabelResult.status === 'ERROR') {
    throw new Error(saveLabelResult.message);
  }

  const UPLOAD_DOCUMENTS_ENABLED = false;

  const additionalDocuments =
    UPLOAD_DOCUMENTS_ENABLED && shippingInstance.additionalDocumentIds?.length
      ? await AdditionalDocument.find({
          _id: {
            $in: shippingInstance.additionalDocumentIds,
          },
        }).select('_id data type contentType')
      : [];

  const documentUploadErrors: { documentId: string; message: string }[] = [];

  for (const additionalDocument of additionalDocuments) {
    try {
      const extension = additionalDocument.contentType.includes('pdf') ? 'pdf' : 'jpg';
      const fileName = `additional-document-${shippingId}.${extension}`;
      const docEndpoint = `${carrierBaseUrl.NAVLUNGO}/api/shipments/v1/${shipmentData.shipmentId}/documents`;

      const docInitRes = await fetch(docEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          ShipmentDocuments: [
            {
              FileName: fileName,
              Type: 'msds',
            },
          ],
        }),
      });

      if (!docInitRes.ok) {
        const errorText = await docInitRes.text();
        const errMessage = `Belge yükleme başlatılamadı: ${errorText}`;
        documentUploadErrors.push({
          documentId: additionalDocument._id.toString(),
          message: errMessage,
        });

        Sentry.captureException(new Error(errMessage), {
          extra: { shippingId, carrierShipmentId: shipmentData.shipmentId, additionalDocumentId: additionalDocument._id.toString() },
        });
      } else {
        const docInitData = await docInitRes.json();
        const uploadUrl = docInitData?.documents?.[0]?.urlInfo?.uploadUrl;

        if (!uploadUrl) {
          const errMessage = `Navlungo dosya yükleme için S3 Presigned URL dönmedi. Gelen Yanıt: ${JSON.stringify(docInitData)}`;
          documentUploadErrors.push({
            documentId: additionalDocument._id.toString(),
            message: errMessage,
          });

          Sentry.captureException(new Error(errMessage), {
            extra: { shippingId, carrierShipmentId: shipmentData.shipmentId, additionalDocumentId: additionalDocument._id.toString() },
          });
        } else {
          const s3PutRes = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': additionalDocument.contentType,
            },
            body: new Uint8Array(additionalDocument.data),
          });

          if (!s3PutRes.ok) {
            const errMessage = `AWS S3'e dosya yükleme başarısız oldu (HTTP ${s3PutRes.status})`;
            documentUploadErrors.push({
              documentId: additionalDocument._id.toString(),
              message: errMessage,
            });

            Sentry.captureException(new Error(errMessage), {
              extra: { shippingId, carrierShipmentId: shipmentData.shipmentId, additionalDocumentId: additionalDocument._id.toString() },
            });
          }
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen belge yükleme hatası';

      documentUploadErrors.push({
        documentId: additionalDocument._id.toString(),
        message: errorMessage,
      });

      Sentry.captureException(error, {
        extra: {
          shippingId,
          carrierShipmentId: shipmentData.shipmentId,
          additionalDocumentId: additionalDocument._id.toString(),
          documentUploadFailed: true,
        },
      });
    }
  }

  return {
    trackingNumber,
    label: labelBuffer.toString('base64'),
    invoice: '',
    carrierShipmentId: shipmentData.shipmentId,
    ...(documentUploadErrors.length > 0 && { documentUploadErrors }),
  };
};

export default createNavlungoPaper;
