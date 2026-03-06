'use server';

import { messages } from '@/constants';
import applyBalanceTransaction from '@/lib/applyBalanceTransaction';
import createFedexLabel from '@/lib/carriers/fedex';
import createUpsLabel from '@/lib/carriers/ups';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import getShippingCost from '@/lib/getShippingCost';
import { CarrierAccount, Shipping, User } from '@/models';

const { GENERAL, PRICING, SHIPPING, USER } = messages;

const createBarcode = async (data: ICreateBarcodeParams): Promise<IActionResponse<{ trackingNumber: string }>> => {
  try {
    await connectMongoDB();

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return { status: 'ERROR', message: GENERAL.UNAUTHORIZED };
    }

    const { id: userId, role } = currentUser;
    const { shippingId, firm, accountNumber } = data;

    const user = await User.findById(userId).lean();

    if (!user) {
      return { status: 'ERROR', message: USER.NOT_FOUND };
    }

    if (!user.barcodePermits.includes(`${firm}-${accountNumber}`)) {
      return {
        status: 'ERROR',
        message: SHIPPING.UNAUTHORIZED,
      };
    }

    const query = role === 'ADMIN' || role === 'OPERATOR' ? { _id: shippingId } : { _id: shippingId, userId };

    const shipping = await Shipping.findOne(query);

    if (!shipping) {
      return { status: 'ERROR', message: SHIPPING.NOT_FOUND };
    }

    if (shipping.carrier?.trackingNumber) {
      return {
        status: 'ERROR',
        message: SHIPPING.ALREADY_LABELED,
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
        message: SHIPPING.CARRIER.NOT_FOUND,
      };
    }

    const credentials = carrierAccount.credentials.reduce((acc: Record<string, string>, item: { key: string; value: string }) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    let carrierResult: { trackingNumber: string; label: string } | null = null;

    if (firm === 'UPS') {
      carrierResult = await createUpsLabel({
        shippingInstance,
        accountNumber,
        credentials: {
          clientId: credentials.clientId,
          clientSecret: credentials.clientSecret,
        },
      });
    } else if (firm === 'FEDEX') {
      carrierResult = await createFedexLabel({
        shippingInstance,
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
        message: SHIPPING.CARRIER.UNSUPPORTED,
      };
    }

    const { trackingNumber } = carrierResult;

    const userForPricing = await User.findById(shipping.userId).lean();

    if (!userForPricing) {
      return {
        status: 'ERROR',
        message: PRICING.USER_NOT_FOUND,
      };
    }

    const shippingCostRes = await getShippingCost(userForPricing.priceListId, shipping.package.weight, shipping.consignee.address.country);

    if (shippingCostRes.status !== 'OK') {
      return {
        status: 'ERROR',
        message: SHIPPING.COST_NOT_CALCULATED,
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
  } catch {
    return {
      status: 'ERROR',
      message: GENERAL.UNEXPECTED_ERROR,
    };
  }
};

export default createBarcode;
