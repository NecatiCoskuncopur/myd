import * as Sentry from '@sentry/nextjs';
import { PDFDocument, StandardFonts } from 'pdf-lib';

import saveShippingDocument from '@/app/actions/shippingDocument/saveShippingDocument';
import { CarrierAccountTypeEnum, carrierBaseUrl, carrierMessages } from '@/constants';
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

const selectNavlungoQuote = (quotes: NavlungoQuote[], accountType: CarrierAccountTypeEnum): NavlungoQuote => {
  const validQuotes = quotes.filter(quote => quote.quoteReference && Number.isFinite(Number(quote.price)));

  if (!validQuotes.length) {
    throw new Error(`${SHIPMENT_FAILED}: Geçerli Navlungo teklifi bulunamadı.`);
  }

  const isEconomy = accountType === CarrierAccountTypeEnum.ECONOMY;
  const preferredQuotes = validQuotes.filter(quote => {
    const serviceType = quote.serviceType.toLowerCase();
    return isEconomy ? serviceType.includes('eco') : !serviceType.includes('eco');
  });

  const candidates = preferredQuotes.length > 0 ? preferredQuotes : validQuotes;
  return [...candidates].sort((a, b) => Number(a.price) - Number(b.price))[0];
};

const getSelectedAdditionalServices = (quote: NavlungoQuote, shippingInstance: ShippingTypes.IShipping): string[] => {
  const selected = new Set<string>();

  for (const service of quote.additionalServices ?? []) {
    if (service.isRequired) selected.add(service.serviceCode);
  }

  if (shippingInstance.detail.payor?.customs === 'SENDER') {
    if (quote.additionalServices?.some(s => s.serviceCode === 'ddp')) selected.add('ddp');
  }

  if (shippingInstance.content.insurance) {
    if (quote.additionalServices?.some(s => s.serviceCode === 'insurance')) selected.add('insurance');
  }

  return [...selected];
};

const generateFallbackLabelPdf = async (cargoLabels: string[], shippingId: string): Promise<Buffer> => {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  for (const [index, label] of cargoLabels.entries()) {
    const page = pdfDoc.addPage([283.46, 425.2]);

    page.drawText('NAVLUNGO KARGO ETIKETI', { x: 20, y: 390, size: 16, font });
    page.drawText(`Siparis No: ${shippingId}`, { x: 20, y: 360, size: 12, font: regularFont });
    page.drawText(`Paket: ${index + 1} / ${cargoLabels.length}`, { x: 20, y: 340, size: 12, font: regularFont });
    page.drawText(label, { x: 20, y: 300, size: 24, font });
    page.drawText('(Barkod numarasi depo tarafindan okutulacaktir)', { x: 20, y: 280, size: 10, font: regularFont });
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};

const createNavlungoPaper = async ({
  shippingInstance,
  credentials,
  shippingId,
  accountType,
  accountNumber,
}: CarrierTypes.ICreatePaper): Promise<{
  trackingNumber: string;
  label: string;
  invoice: string;
  carrierShipmentId: string;
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

  const quotePayload = {
    order: {
      orderReference: shippingId,
      currencyCode: String(content.currency),
      receiverAddress: {
        contactName: consignee.company || consignee.name,
        countryCode: consignee.address.country.toUpperCase(),
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
        hsCode: product.gtip,
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

  const quote = selectNavlungoQuote(quoteData.quotes, accountType);
  const selectedAdditionalServices = getSelectedAdditionalServices(quote, shippingInstance);

  const shipmentRes = await fetch(`${carrierBaseUrl.NAVLUNGO}/stores/v2/${store.storeId}/orders/${shippingId}/ship`, {
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

  let labelBuffer: Buffer | null = null;
  const cargoLabelsArray = shipmentData.cargoLabels?.length ? shipmentData.cargoLabels : [trackingNumber];

  const labelRes = await fetch(`${carrierBaseUrl.NAVLUNGO}/api/shipments/v1/${shipmentData.shipmentId}/label`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  }).catch(() => null);

  if (labelRes?.ok) {
    const labelData = (await labelRes.json().catch(() => null)) as NavlungoLabelDownloadResponse | null;
    if (labelData?.labelUrl) {
      const labelPdfRes = await fetch(labelData.labelUrl).catch(() => null);
      if (labelPdfRes?.ok) {
        labelBuffer = Buffer.from(await labelPdfRes.arrayBuffer());
      }
    }
  }

  if (!labelBuffer) {
    console.warn('[NAVLUNGO] ORIJINAL ETIKET ALINAMADI, YEDEK PDF URETILIYOR...');
    labelBuffer = await generateFallbackLabelPdf(cargoLabelsArray, shippingId);
  }

  const saveLabelResult = await saveShippingDocument({
    shippingId,
    label: labelBuffer,
  });

  if (saveLabelResult.status === 'ERROR') {
    throw new Error(saveLabelResult.message);
  }

  return {
    trackingNumber,
    label: labelBuffer.toString('base64'),
    invoice: '',
    carrierShipmentId: shipmentData.shipmentId,
  };
};

export default createNavlungoPaper;
