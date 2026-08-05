import { Storage } from '@/lib/storage';
import { carrierMessages, company } from '@/constants';
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
}: CarrierTypes.ICreatePaper): Promise<{
  trackingNumber: string;
  label: string;
  invoice: string;
}> => {
  try {
    const formattedAccountNumber = String(accountNumber).trim();

    const body = {
      currency: 'USD',
      ioss: shippingInstance.detail.iossNumber,
      serviceTypeId: '1',
      integratorId: '2',
      contentId: 1,
      customsExpensesId: shippingInstance.detail.payor?.customs === 'SENDER' ? 1 : 0,
      shipmentStatusId: 0,
      totalWeight: shippingInstance.package.weight * shippingInstance.package.numberOfPackage,
      applyInsurance: shippingInstance.content.insurance > 0,
      shipmentReasonId: ['GIFT', 'PERSONAL', 'SAMPLE'].includes(shippingInstance.detail.purpose) ? 0 : 2,
      shippingAddress: {
        firstName: hasCustomInfo && customInfo ? customInfo.firstName : (shippingInstance.sender.nickname || shippingInstance.sender.name).split(' ')[0],
        lastName:
          hasCustomInfo && customInfo
            ? customInfo.lastName || ''
            : (shippingInstance.sender.nickname || shippingInstance.sender.name).split(' ').slice(1).join(' '),
        companyName: hasCustomInfo && customInfo ? customInfo.company || '' : shippingInstance.sender.company,
        phoneNumber: company.phone,
        email: hasCustomInfo && customInfo ? customInfo.email : shippingInstance.sender.email,
        zipCode: hasCustomInfo && customInfo ? customInfo?.address?.postalCode : shippingInstance.sender.address.postalCode,
        countryCode: 'TR',
        cityName: hasCustomInfo && customInfo ? customInfo?.address?.city : shippingInstance.sender.address.city,
        address1: hasCustomInfo && customInfo ? customInfo?.address?.line1 : shippingInstance.sender.address.line1,
        address2: hasCustomInfo && customInfo ? customInfo?.address?.line2 || '' : shippingInstance.sender.address.line2 || '',
        isCorporate: false,
        saveAddress: false,
      },
      consigneeAddress: {
        firstName: shippingInstance.consignee.name,
        lastName: '',
        companyName: shippingInstance.consignee.company,
        countryCode: shippingInstance.consignee.address.country,
        address1: shippingInstance.consignee.address.line1,
        address2: shippingInstance.consignee.address.line2 || '',
        cityName: shippingInstance.consignee.address.city,
        phoneNumber: shippingInstance.consignee.phone ? `+${shippingInstance.consignee.phone}`.replace('-', '') : '111111111111',
        email: shippingInstance.consignee.email,
        zipCode: String(shippingInstance.consignee.address.postalCode).split('-')[0],
        stateProvinceCode: shippingInstance.consignee.address.state,
        addressType: 0,
        isCorporate: false,
        saveAddress: false,
      },

      items: Array.from(
        {
          length: shippingInstance.package.numberOfPackage,
        },
        () => ({
          quantity: 1,

          weight: shippingInstance.package.weight,

          width: shippingInstance.package.width,

          size: shippingInstance.package.length,

          height: shippingInstance.package.height,
        }),
      ),

      goods: shippingInstance.content.products.map((product: ShippingTypes.IProduct) => ({
        description: product.name,
        price: product.unitPrice,
        quantity: product.piece,
        gtip: product.gtip || '',
        productOriginCountry: 'TR',
      })),
    };

    const response = await fetch(BASE_URL, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        accountNumber: formattedAccountNumber,
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
