'use server';

import * as Sentry from '@sentry/nextjs';

import { carrierMessages, generalMessages, pricingListMessages, shippingMessages, userMessages } from '@/constants';
import applyBalanceTransaction from '@/lib/applyBalanceTransaction';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import getShippingCost from '@/lib/getShippingCost';
import { CarrierAccount, Shipping, User } from '@/models';
import createFedexPaper from '@/lib/carriers/fedex';
import createUpsPaper from '@/lib/carriers/ups';

const { UNAUTHORIZED, UNEXPECTED_ERROR } = generalMessages;

const carrierDrivers: Record<string, (params: any) => Promise<{ trackingNumber: string; label: string; invoice: string }>> = {
  FEDEX: createFedexPaper,
  UPS: createUpsPaper,
};

const createBarcode = async (data: ShippingTypes.ICreateBarcodeParams): Promise<ResponseTypes.IActionResponse<{ trackingNumber: string }>> => {
  try {
    await connectMongoDB();
    const currentUser = await getCurrentUser();

    if (!currentUser) return { status: 'ERROR', message: UNAUTHORIZED };

    const { id: userId, role } = currentUser;
    const { shippingId, firm, accountNumber } = data;

    const driver = carrierDrivers[firm];
    if (!driver) return { status: 'ERROR', message: carrierMessages.UNSUPPORTED };

    const user = await User.findById(userId).lean();
    if (!user) return { status: 'ERROR', message: userMessages.NOT_FOUND };

    const query = role === 'ADMIN' || role === 'OPERATOR' ? { _id: shippingId } : { _id: shippingId, userId };
    const shipping = await Shipping.findOne(query);

    if (!shipping) return { status: 'ERROR', message: shippingMessages.NOT_FOUND };
    if (shipping.carrier?.trackingNumber) return { status: 'ERROR', message: shippingMessages.ALREADY_LABELED };

    const shippingInstance = JSON.parse(JSON.stringify(shipping));

    const carrierAccount = await CarrierAccount.findOne({
      carrier: firm,
      accountNumber,
      isActive: true,
    }).lean();

    if (!carrierAccount) return { status: 'ERROR', message: carrierMessages.NOT_FOUND };

    const hasPermission = user.barcodePermits?.some((permitId: string) => permitId.toString() === carrierAccount._id.toString());
    if (!hasPermission) return { status: 'ERROR', message: carrierMessages.UNAUTHORIZED };

    const credentials = carrierAccount.credentials.reduce((acc: Record<string, string>, item: { key: string; value: string }) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    const carrierResult = await driver({
      shippingInstance,
      accountNumber,
      credentials: {
        apiKey: credentials.apiKey,
        secretKey: credentials.secretKey,
      },
      shippingId: shipping._id.toString(),
    });

    if (!carrierResult) return { status: 'ERROR', message: carrierMessages.UNSUPPORTED };

    const { trackingNumber } = carrierResult;

    const userForPricing = await User.findById(shipping.userId).lean();
    if (!userForPricing) return { status: 'ERROR', message: pricingListMessages.PRICING.USER_NOT_FOUND };

    const shippingCostRes = await getShippingCost(userForPricing.priceListId, shipping.package.weight, shipping.consignee.address.country);
    if (shippingCostRes.status !== 'OK') return { status: 'ERROR', message: shippingMessages.COST_NOT_CALCULATED };

    const shippingCost = shippingCostRes.data;
    await applyBalanceTransaction('SPEND', shipping.userId, shippingCost, shipping._id);

    shipping.carrier = {
      trackingNumber,
      name: firm,
      account: accountNumber,
      amount: shippingCost,
    };

    shipping.status = 'LABELED';

    await shipping.save();

    return {
      status: 'OK',
      data: { trackingNumber },
    };
  } catch (error) {
    console.log(error);
    if (error instanceof Error) Sentry.captureException(error);
    return { status: 'ERROR', message: UNEXPECTED_ERROR };
  }
};

export default createBarcode;
