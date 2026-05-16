'use server';

import * as Sentry from '@sentry/nextjs';

import { carrierMessages, generalMessages, pricingListMessages, shippingMessages, userMessages } from '@/constants';
import applyBalanceTransaction from '@/lib/applyBalanceTransaction';
import createFedexLabel from '@/lib/carriers/fedex';
// import createUpsLabel from '@/lib/carriers/ups';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import getShippingCost from '@/lib/getShippingCost';
import { CarrierAccount, Shipping, User } from '@/models';
import { Storage } from '@/lib/storage';
const { UNAUTHORIZED, UNEXPECTED_ERROR } = generalMessages;

const createBarcode = async (data: ShippingTypes.ICreateBarcodeParams): Promise<ResponseTypes.IActionResponse<{ trackingNumber: string }>> => {
  try {
    await connectMongoDB();

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return { status: 'ERROR', message: UNAUTHORIZED };
    }

    const { id: userId, role } = currentUser;
    const { shippingId, firm, accountNumber } = data;

    const user = await User.findById(userId).lean();

    if (!user) {
      return { status: 'ERROR', message: userMessages.NOT_FOUND };
    }

    const query = role === 'ADMIN' || role === 'OPERATOR' ? { _id: shippingId } : { _id: shippingId, userId };

    const shipping = await Shipping.findOne(query);

    if (!shipping) {
      return { status: 'ERROR', message: shippingMessages.NOT_FOUND };
    }

    if (shipping.carrier?.trackingNumber) {
      return {
        status: 'ERROR',
        message: shippingMessages.ALREADY_LABELED,
      };
    }

    const shippingInstance = JSON.parse(JSON.stringify(shipping));

    const carrierAccount = await CarrierAccount.findOne({
      carrier: firm,
      accountNumber,
      isActive: true,
    }).lean();

    if (!carrierAccount) {
      return {
        status: 'ERROR',
        message: carrierMessages.NOT_FOUND,
      };
    }

    const hasPermission = user.barcodePermits?.some((permitId: string) => permitId.toString() === carrierAccount._id.toString());

    if (!hasPermission) {
      return { status: 'ERROR', message: carrierMessages.UNAUTHORIZED };
    }

    const credentials = carrierAccount.credentials.reduce((acc: Record<string, string>, item: { key: string; value: string }) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    let carrierResult: { trackingNumber: string; label: string; invoice: string } | null = null;

    if (firm === 'UPS') {
      /*  carrierResult = await createUpsLabel({
        shippingInstance,
        accountNumber,
        credentials: {
          clientId: credentials.clientId,
          clientSecret: credentials.clientSecret,
        },
      })*/
      console.log('UPS');
    } else if (firm === 'FEDEX') {
      const fedexResult = await createFedexLabel({
        shippingInstance: {
          shipper: {
            name: shippingInstance.sender.name,
            address: `${shippingInstance.sender.address.line1} ${shippingInstance.sender.address.line2 || ''}`.trim(),
            city: shippingInstance.sender.address.city,
            postalCode: shippingInstance.sender.address.postalCode,
            countryCode: 'TR',
            phoneNumber: shippingInstance.sender.phone.replace(/\D/g, ''),
          },
          recipient: {
            name: shippingInstance.consignee.name,
            address: `${shippingInstance.consignee.address.line1} ${shippingInstance.consignee.address.line2 || ''}`.trim(),
            city: shippingInstance.consignee.address.city,
            postalCode: shippingInstance.consignee.address.postalCode,
            countryCode: shippingInstance.consignee.address.country,
            phoneNumber: (shippingInstance.consignee.phone || '').replace(/\D/g, ''),
            stateOrProvinceCode: shippingInstance.consignee.address.state || '',
          },

          detail: shippingInstance.detail,
          content: shippingInstance.content,
          package: shippingInstance.package,
        },
        accountNumber,
        credentials: {
          apiKey: credentials.apiKey,
          secretKey: credentials.secretKey,
        },
      });

      if (fedexResult) {
        const { trackingNumber, label, invoice } = fedexResult;

        if (label) {
          await Storage.putObject({
            Bucket: 'labels',
            Key: `${shipping._id}.pdf`,
            Body: Buffer.from(label, 'base64'),
          });
        }

        if (invoice) {
          await Storage.putObject({
            Bucket: 'invoices',
            Key: `${shipping._id}.pdf`,
            Body: Buffer.from(invoice, 'base64'),
          });
        }
        carrierResult = { trackingNumber, label, invoice };
      }
    }

    if (!carrierResult) {
      return {
        status: 'ERROR',
        message: carrierMessages.UNSUPPORTED,
      };
    }

    const { trackingNumber } = carrierResult;

    const userForPricing = await User.findById(shipping.userId).lean();

    if (!userForPricing) {
      return {
        status: 'ERROR',
        message: pricingListMessages.PRICING.USER_NOT_FOUND,
      };
    }

    const shippingCostRes = await getShippingCost(userForPricing.priceListId, shipping.package.weight, shipping.consignee.address.country);

    if (shippingCostRes.status !== 'OK') {
      return {
        status: 'ERROR',
        message: shippingMessages.COST_NOT_CALCULATED,
      };
    }

    const shippingCost = shippingCostRes.data;

    await applyBalanceTransaction('SPEND', shipping.userId, shippingCost, shipping._id);

    shipping.carrier = {
      trackingNumber,
      name: firm,
      account: accountNumber,
      amount: shippingCost,
    };

    await shipping.save();

    return {
      status: 'OK',
      data: { trackingNumber },
    };
  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      Sentry.captureException(error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default createBarcode;
