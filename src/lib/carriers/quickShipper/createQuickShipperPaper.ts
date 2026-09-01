import * as Sentry from '@sentry/node';
import latinize from 'latinize';

import saveShippingDocument from '@/app/actions/shippingDocument/saveShippingDocument';
import { CarrierAccountTypeEnum, carrierMessages } from '@/constants';
import { CarrierTypes } from '@/types/carrier';
import { ShippingTypes } from '@/types/shipping';

const { SHIPMENT_FAILED, TRACKING_NUMBER_NOT_FOUND } = carrierMessages;

const BASE_URL = 'https://api.quickshipper.com/api/affiliate/shipments/addshipmentbroker';

const createQuickShipperPaper = async ({
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
  const { consignee, content, detail, sender, package: pkg } = shippingInstance;

  const senderName =
    hasCustomInfo && customInfo ? `${customInfo.firstName} ${customInfo.lastName}` : shippingInstance.sender.nickname || shippingInstance.sender.name;

  const senderEmail = hasCustomInfo && customInfo ? customInfo.email : sender.email;

  const senderData = {
    firstName: latinize(senderName),
    lastName: '',
    companyName: latinize(hasCustomInfo && customInfo ? customInfo.company : sender.company || sender.name),
    phoneNumber: hasCustomInfo && customInfo ? customInfo.phone : sender.phone,
    email: senderEmail,
    zipCode: hasCustomInfo && customInfo ? customInfo.address?.postalCode : sender.address.postalCode,
    countryCode: 'TR',
    cityName: latinize(hasCustomInfo && customInfo ? customInfo.address?.city : sender.address.city),
    address1: latinize(hasCustomInfo && customInfo ? customInfo.address?.line1 : shippingInstance.sender.address.line1),
    address2: latinize(hasCustomInfo && customInfo ? customInfo.address?.line2 || '' : shippingInstance.sender.address.line2 || ''),
    isCorporate: false,
    saveAddress: false,
  };

  const consigneeData = {
    firstName: latinize(consignee.name),
    lastName: '',
    companyName: latinize(consignee.company || consignee.name),
    countryCode: consignee.address.country,
    address1: latinize(consignee.address.line1),
    address2: latinize(consignee.address.line2 || ''),
    cityName: latinize(consignee.address.city),
    phoneNumber: consignee.phone ? String(`+${consignee.phone}`).replace('-', '') : '111111111111',
    email: consignee.email,
    zipCode: String(consignee.address.postalCode).split('-')[0],
    stateProvinceCode: consignee.address.state,
    addressType: 0,
    isCorporate: false,
    saveAddress: false,
  };

  const serviceType = accountType === CarrierAccountTypeEnum.ECONOMY ? '48' : '2';

  const body = {
    currency: 'USD',
    ioss: detail.iossNumber,
    serviceTypeId: '1',
    integratorId: serviceType,
    contentId: 1,
    customsExpensesId: detail.payor?.customs === 'SENDER' ? 1 : 0,
    shipmentStatusId: 0,
    totalWeight: shippingInstance.package.weight * shippingInstance.package.numberOfPackage,
    applyInsurance: shippingInstance.content.insurance ?? false,
    shipmentReasonId: ['GIFT', 'PERSONAL', 'SAMPLE'].includes(shippingInstance.detail.purpose) ? 0 : 2,
    shippingAddress: senderData,
    consigneeAddress: consigneeData,

    items: [...Array(pkg.numberOfPackage).keys()].map(() => ({
      quantity: 1,
      weight: pkg.weight,
      width: pkg.width,
      size: pkg.length,
      height: pkg.height,
    })),

    goods: content.products.map((product: ShippingTypes.IProduct) => ({
      description: product.name,
      price: product.unitPrice,
      quantity: product.piece,
      gtip: product.gtip || '',
      productOriginCountry: '',
    })),
  };

  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accountNumber,
      'qs-key': credentials.apiKey,
      'qs-secret': credentials.apiSecret,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const responseText = await response.text();

    let errorData: unknown;

    try {
      errorData = JSON.parse(responseText);
    } catch {
      errorData = responseText;
    }

    const error = new Error(`${SHIPMENT_FAILED}: HTTP ${response.status} - ${typeof errorData === 'string' ? errorData : JSON.stringify(errorData)}`);

    Sentry.captureException(error, {
      extra: {
        shippingId,
        senderName,
        senderEmail,
        quickShipperError: errorData,
        responseStatus: response.status,
        responseStatusText: response.statusText,
        responseBody: errorData,
      },
    });

    throw error;
  }

  const shipmentData = await response.json();
  const output = shipmentData?.data;

  const trackingNumber = output?.integratorAWBNumber;

  if (!trackingNumber) {
    const error = new Error(TRACKING_NUMBER_NOT_FOUND);

    Sentry.captureException(error, {
      extra: {
        shippingId,
        senderName,
        senderEmail,
        quickShipperResponse: shipmentData,
      },
    });

    throw error;
  }

  const label = output?.labels?.[0] || '';

  if (!label) {
    const error = new Error(`${SHIPMENT_FAILED}: QuickShipper label bulunamadı.`);

    Sentry.captureException(error, {
      extra: {
        shippingId,
        senderName,
        senderEmail,
        trackingNumber,
        quickShipperResponse: shipmentData,
      },
    });

    throw error;
  }

  const labelBuffer = Buffer.from(label, 'base64');

  if (!labelBuffer.length) {
    const error = new Error(`${SHIPMENT_FAILED}: QuickShipper label boş.`);

    Sentry.captureException(error, {
      extra: {
        shippingId,
        senderName,
        senderEmail,
        trackingNumber,
      },
    });

    throw error;
  }

  const saveLabelResult = await saveShippingDocument({
    shippingId,
    label: labelBuffer,
  });

  if (saveLabelResult.status === 'ERROR') {
    const error = new Error(saveLabelResult.message);

    Sentry.captureException(error, {
      extra: {
        shippingId,
        senderName,
        senderEmail,
        trackingNumber,
        documentSaveError: saveLabelResult,
      },
    });

    throw error;
  }

  return {
    trackingNumber,
    label: labelBuffer.toString('base64'),
    invoice: '',
  };
};

export default createQuickShipperPaper;
