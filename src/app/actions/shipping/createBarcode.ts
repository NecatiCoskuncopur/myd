'use server';

import * as Sentry from '@sentry/nextjs';

import { carrierMessages, generalMessages, pricingListMessages, shippingMessages, ShippingStatus, userMessages } from '@/constants';
import applyBalanceTransaction from '@/lib/applyBalanceTransaction';
import createFedexPaper from '@/lib/carriers/fedex';
import createQuickShipperPaper from '@/lib/carriers/quickShipper';
import createUpsPaper from '@/lib/carriers/ups';
import connectMongoDB from '@/lib/db';
import getCarrierCost from '@/lib/getCarrierCost';
import { getCurrentUser } from '@/lib/getCurrentUser';
import getShippingCost from '@/lib/getShippingCost';
import { CarrierAccount, Shipping, User } from '@/models';
import { CarrierTypes } from '@/types/carrier';
import { ShippingTypes } from '@/types/shipping';

const { UNAUTHORIZED, UNEXPECTED_ERROR } = generalMessages;

const carrierDrivers: Record<
  string,
  (params: CarrierTypes.ICarrierDriverParams) => Promise<{
    trackingNumber: string;
    label: string;
    invoice: string;
  }>
> = {
  FEDEX: createFedexPaper,
  UPS: createUpsPaper,
  QUICKSHIPPER: createQuickShipperPaper,
};

const createBarcode = async (data: ShippingTypes.ICreateBarcodeParams): Promise<ResponseTypes.IActionResponse<{ trackingNumber: string }>> => {
  try {
    await connectMongoDB();
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        status: 'ERROR',
        message: UNAUTHORIZED,
      };
    }

    const { id: userId, role } = currentUser;
    const { shippingId, firm, displayName, accountNumber, carrierAccountId, customInfo, hasCustomInfo } = data;

    const driver = carrierDrivers[firm];

    if (!driver) {
      return {
        status: 'ERROR',
        message: carrierMessages.UNSUPPORTED,
      };
    }

    const user = await User.findById(userId).lean();

    if (!user) {
      return {
        status: 'ERROR',
        message: userMessages.NOT_FOUND,
      };
    }

    const query = role === 'ADMIN' || role === 'OPERATOR' ? { _id: shippingId } : { _id: shippingId, userId };

    const shipping = await Shipping.findOne(query);

    if (!shipping) {
      return {
        status: 'ERROR',
        message: shippingMessages.NOT_FOUND,
      };
    }

    if (shipping.carrier?.trackingNumber) {
      return {
        status: 'ERROR',
        message: shippingMessages.ALREADY_LABELED,
      };
    }

    const carrierAccount = await CarrierAccount.findOne({
      _id: carrierAccountId,
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
      return {
        status: 'ERROR',
        message: carrierMessages.UNAUTHORIZED,
      };
    }

    const userForPricing = await User.findById(shipping.userId).lean();

    if (!userForPricing) {
      return {
        status: 'ERROR',
        message: pricingListMessages.PRICING.USER_NOT_FOUND,
      };
    }

    const userPriceList = userForPricing.priceLists?.find(priceList => priceList.serviceType === carrierAccount.accountType);

    if (!userPriceList) {
      return {
        status: 'ERROR',
        message: pricingListMessages.NOT_FOUND,
      };
    }

    const shippingCostRes = await getShippingCost(userPriceList.priceListId, shipping!.package!.weight, shipping!.consignee!.address!.country);

    if (shippingCostRes.status !== 'OK') {
      return {
        status: 'ERROR',
        message: shippingMessages.COST_NOT_CALCULATED,
      };
    }

    const carrierCostRes = await getCarrierCost(carrierAccount!.pricing!, shipping!.package!.weight, shipping!.consignee!.address!.country);
    if (carrierCostRes.status !== 'OK') {
      return {
        status: 'ERROR',
        message: shippingMessages.COST_NOT_CALCULATED,
      };
    }

    const carrierCost = carrierCostRes.data;
    const shippingCost = shippingCostRes.data;

    const credentials = carrierAccount.credentials.reduce((acc: Record<string, string>, item: { key: string; value: string }) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    const carrierCredentials = {
      FEDEX: {
        apiKey: credentials.apiKey,
        secretKey: credentials.secretKey,
      },
      UPS: {
        clientId: credentials.clientId,
        clientSecret: credentials.clientSecret,
      },
      QUICKSHIPPER: {
        apiKey: credentials.apiKey,
        apiSecret: credentials.apiSecret,
      },
    };

    const shippingInstance = JSON.parse(JSON.stringify(shipping));

    const carrierResult = await driver({
      shippingInstance,
      accountNumber,
      hasCustomInfo,
      customInfo,
      credentials: carrierCredentials[firm as keyof typeof carrierCredentials],
      shippingId: shipping._id.toString(),
    });

    if (!carrierResult) {
      return {
        status: 'ERROR',
        message: carrierMessages.UNSUPPORTED,
      };
    }

    const { trackingNumber } = carrierResult;
    await applyBalanceTransaction('SPEND', shipping.userId.toString(), shippingCost, shipping._id.toString());

    shipping.carrier = {
      trackingNumber,
      name: firm,
      displayName,
      account: accountNumber,
      accountType: carrierAccount.accountType,
      amount: shippingCost,
      cost: carrierCost,
    };

    shipping.status = ShippingStatus.LABELED;
    shipping.labeledAt = new Date();
    await shipping.save();

    return {
      status: 'OK',
      data: {
        trackingNumber,
      },
    };
  } catch (error) {
    Sentry.withScope(scope => {
      scope.setTag('action', 'createBarcode');
      scope.captureException(error);
    });

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default createBarcode;
