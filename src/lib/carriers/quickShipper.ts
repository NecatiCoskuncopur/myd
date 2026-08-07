import { Storage } from '@/lib/storage';
import { carrierMessages } from '@/constants';
import { CarrierTypes } from '@/types/carrier';
import { ShippingTypes } from '@/types/shipping';
import latinize from 'latinize';

const { SHIPMENT_FAILED, TRACKING_NUMBER_NOT_FOUND } = carrierMessages;

const BASE_URL = 'https://api.quickshipper.com/api/affiliate/shipments/addshipmentbroker';

const createQuickShipperPaper = async ({
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
  try {
    const { consignee, content, detail, sender, package: pkg } = shippingInstance;

    const senderData = {
      firstName: latinize(
        hasCustomInfo && customInfo ? `${customInfo.firstName} ${customInfo.lastName}` : shippingInstance.sender.nickname || shippingInstance.sender.name,
      ),
      lastName: '',
      companyName: latinize(hasCustomInfo && customInfo ? customInfo.company : sender.company || sender.name),
      phoneNumber: hasCustomInfo && customInfo ? customInfo.phone : sender.phone,
      email: hasCustomInfo && customInfo ? customInfo.email : sender.email,
      zipCode: hasCustomInfo && customInfo ? customInfo?.address?.postalCode : sender.address.postalCode,
      countryCode: 'TR',
      cityName: latinize(hasCustomInfo && customInfo ? customInfo?.address?.city : sender.address.city),
      address1: latinize(hasCustomInfo && customInfo ? customInfo?.address?.line1 : shippingInstance.sender.address.line1),
      address2: latinize(hasCustomInfo && customInfo ? customInfo?.address?.line2 || '' : shippingInstance.sender.address.line2 || ''),
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
      phoneNumber: consignee.phone ? String('+' + consignee.phone).replace('-', '') : '111111111111',
      email: consignee.email,
      zipCode: String(consignee.address.postalCode).split('-')[0],
      stateProvinceCode: consignee.address.state,
      addressType: 0,
      isCorporate: false,
      saveAddress: false,
    };

    const body = {
      currency: 'USD',
      ioss: detail.iossNumber,
      serviceTypeId: '1',
      integratorId: '2',
      contentId: 1,
      customsExpensesId: detail.payor?.customs === 'SENDER' ? 1 : 0,
      shipmentStatusId: 0,
      totalWeight: shippingInstance.package.weight * shippingInstance.package.numberOfPackage,
      applyInsurance: shippingInstance.content.insurance > 0,
      shipmentReasonId: ['GIFT', 'PERSONAL', 'SAMPLE'].includes(shippingInstance.detail.purpose) ? 0 : 2,
      shippingAddress: {
        ...senderData,
      },
      consigneeAddress: {
        ...consigneeData,
      },

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
        'qs-key': credentials['qs-key'],
        'qs-secret': credentials['qs-secret'],
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();

      console.error('QUICKSHIPPER ERROR:', JSON.stringify(errorData, null, 2));

      throw new Error(`${SHIPMENT_FAILED}: ${JSON.stringify(errorData)}`);
    }

    const shipmentData = await response.json();

    const output = shipmentData?.data;

    const trackingNumber = output?.integratorAWBNumber;

    if (!trackingNumber) {
      throw new Error(TRACKING_NUMBER_NOT_FOUND);
    }

    const label = output?.labels?.[0] || '';

    if (label) {
      await Storage.putObject({
        Bucket: 'labels',

        Key: `${shippingId}.pdf`,

        Body: Buffer.from(label, 'base64'),
      });

      console.log(`[Storage] QuickShipper label (${shippingId}.pdf) kaydedildi.`);
    }

    return {
      trackingNumber,

      label,

      invoice: '',
    };
  } catch (error) {
    console.error('[QUICKSHIPPER LABEL ERROR]', error);

    throw error;
  }
};

export default createQuickShipperPaper;
