'use server';

import { carrierMessages, generalMessages, pricingListMessages, shippingMessages, ShippingPayor, ShippingStatus, userMessages } from '@/constants';
import applyBalanceTransaction from '@/lib/applyBalanceTransaction';
import captureActionError from '@/lib/captureActionError';
import createCarrierPaper from '@/lib/carriers/createCarrierPaper';
import getCarrierTaxAmount from '@/lib/carriers/getCarrierTaxAmount';
import connectMongoDB from '@/lib/db';
import getCarrierCost from '@/lib/getCarrierCost';
import { getCurrentUser } from '@/lib/getCurrentUser';
import getShippingCost from '@/lib/getShippingCost';
import { CarrierAccount, Shipping, User } from '@/models';
import { ShippingTypes } from '@/types/shipping';

const { UNAUTHORIZED, UNEXPECTED_ERROR } = generalMessages;

const createBarcode = async (data: ShippingTypes.ICreateBarcodeParams): Promise<ResponseTypes.IActionResponse<{ trackingNumber: string }>> => {
  try {
    await connectMongoDB();
    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return {
        status: 'ERROR',
        message: UNAUTHORIZED,
      };
    }

    const { id: userId, role } = currentUser;

    const { shippingId, firm, displayName, accountNumber, carrierAccountId, customInfo, hasCustomInfo } = data;

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

    const weight = shipping.package?.weight;
    const country = shipping.consignee?.address?.country;

    if (!weight || !country) {
      return {
        status: 'ERROR',
        message: shippingMessages.COST_NOT_CALCULATED,
      };
    }

    const shippingCostRes = await getShippingCost(userPriceList.priceListId, weight, country);

    if (shippingCostRes.status !== 'OK') {
      return {
        status: 'ERROR',
        message: shippingMessages.COST_NOT_CALCULATED,
      };
    }

    const carrierCostRes = await getCarrierCost(carrierAccount.pricing!, weight, country);

    if (carrierCostRes.status !== 'OK') {
      return {
        status: 'ERROR',
        message: shippingMessages.COST_NOT_CALCULATED,
      };
    }

    const shippingCost = shippingCostRes.data;
    const carrierCost = carrierCostRes.data;
    const insuranceAmount = shipping.content?.insurance ? (shipping.content.insuranceAmount ?? 0) : 0;

    const shippingInstance = JSON.parse(JSON.stringify(shipping));

    const taxAmount =
      shipping?.detail?.payor?.customs === ShippingPayor.SENDER
        ? await getCarrierTaxAmount({
            firm,
            credentials: carrierAccount.credentials,
            shippingInstance,
            accountType: carrierAccount.accountType,
            cost: carrierCost,
          })
        : 0;

    const totalShippingCost = Number((shippingCost + insuranceAmount + taxAmount).toFixed(2));

    const carrierResult = await createCarrierPaper({
      firm,
      shippingInstance,
      accountNumber,
      hasCustomInfo,
      customInfo,
      credentials: carrierAccount.credentials,
      accountType: carrierAccount.accountType,
      shippingId: shipping._id.toString(),
    });

    const { trackingNumber } = carrierResult;

    await applyBalanceTransaction('SPEND', shipping.userId.toString(), totalShippingCost, shipping._id.toString());

    shipping.carrier = {
      trackingNumber,
      name: firm,
      displayName,
      account: accountNumber,
      accountType: carrierAccount.accountType,
      amount: shippingCost,
      cost: carrierCost,
      insuranceCost: insuranceAmount,
      dutiesAndTaxesCost: taxAmount,
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
    if (error instanceof Error) {
      captureActionError('createBarcode', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default createBarcode;
