'use server';

import * as Sentry from '@sentry/nextjs';

import { carrierMessages, generalMessages, pricingListMessages, shippingMessages, userMessages } from '@/constants';
import applyBalanceTransaction from '@/lib/applyBalanceTransaction';
import createFedexLabel from '@/lib/carriers/fedex';
import createUpsLabel from '@/lib/carriers/ups';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import getShippingCost from '@/lib/getShippingCost';
import { CarrierAccount, Shipping, User } from '@/models';

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

    if (!user.barcodePermits.includes(`${firm}-${accountNumber}`)) {
      return {
        status: 'ERROR',
        message: carrierMessages.UNAUTHORIZED,
      };
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

    const shippingInstance = {
      shipper: {
        name: shipping.sender?.name,
        address: `${shipping.sender?.address?.line1}, ${shipping.sender?.address?.line2 || ''}`,
        city: shipping.sender?.address?.city,
        postalCode: shipping.sender?.address?.postalCode,
        countryCode: 'TR',
      },
      recipient: {
        name: shipping.consignee.name,
        address: `${shipping.consignee?.address?.line1}, ${shipping.consignee?.address?.line2 || ''}`,
        stateCode: shipping.consignee.address.state || '',
        city: shipping.consignee.address.city,
        postalCode: shipping.consignee.address.postalCode,
        countryCode: shipping.consignee.address.country,
      },
      package: {
        weight: Math.max(shipping.package.weight, shipping.package.volumetricWeight),
        unit: 'KG',
      },
    };

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

    const credentials = carrierAccount.credentials.reduce((acc: Record<string, string>, item: { key: string; value: string }) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    let carrierResult: { trackingNumber: string; label: string } | null = null;
    const safeShippingInstance = JSON.parse(JSON.stringify(shippingInstance));

    if (firm === 'UPS') {
      carrierResult = await createUpsLabel({
        shippingInstance: safeShippingInstance,
        accountNumber,
        credentials: {
          clientId: credentials.clientId,
          clientSecret: credentials.clientSecret,
        },
      });
    } else if (firm === 'FEDEX') {
      carrierResult = await createFedexLabel({
        shippingInstance: safeShippingInstance,
        accountNumber,
        credentials: {
          apiKey: credentials.apiKey,
          secretKey: credentials.secretKey,
        },
      });
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
