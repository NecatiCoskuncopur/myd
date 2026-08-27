'use server';

import { ValidationError } from 'yup';

import { generalMessages, pricingListMessages, shippingMessages, ShippingStatus, UserRole, VOLUMETRIC_WEIGHT_DIVISOR } from '@/constants';
import applyBalanceTransaction from '@/lib/applyBalanceTransaction';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import getShippingCost from '@/lib/getShippingCost';
import requireRoles from '@/lib/requireRoles';
import { Shipping, User } from '@/models';
import updatePackageDimensionsSchema from '@/schemas/updatePackageDimensions.schema';
import { AdminTypes } from '@/types/admin';

const { UNEXPECTED_ERROR } = generalMessages;
const { NOT_FOUND, UPDATESHIPPING } = shippingMessages;
const { PRICING, NOT_FOUND: PL_NOT_FOUND } = pricingListMessages;

const updatePackageDimensions = async (data: AdminTypes.IUpdatePackageDimensionsPayload): Promise<ResponseTypes.IActionResponse> => {
  try {
    const authError = await requireRoles([UserRole.ADMIN, UserRole.OPERATOR]);
    if (authError) return authError;

    const validatedData = await updatePackageDimensionsSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    await connectMongoDB();

    const { shippingId, weight, width, height, length } = validatedData;

    const volumetricWeight = (length * width * height) / VOLUMETRIC_WEIGHT_DIVISOR;

    const shipping = await Shipping.findById(shippingId);

    if (!shipping) {
      return {
        status: 'ERROR',
        message: NOT_FOUND,
      };
    }

    if (shipping.status !== ShippingStatus.LABELED) {
      shipping.package = {
        numberOfPackage: shipping.package?.numberOfPackage ?? 1,
        weight,
        width,
        height,
        length,
        volumetricWeight,
      };
      shipping.packageDimensionsUpdated = true;

      await shipping.save();

      return {
        status: 'OK',
        message: UPDATESHIPPING.SUCCESS,
      };
    }

    const currentShippingCost = shipping.carrier?.amount ?? 0;

    const userForPricing = await User.findById(shipping.userId).lean();

    if (!userForPricing) {
      return {
        status: 'ERROR',
        message: PRICING.USER_NOT_FOUND,
      };
    }

    const accountType = shipping.carrier?.accountType;

    if (!accountType) {
      return {
        status: 'ERROR',
        message: PL_NOT_FOUND,
      };
    }

    const userPriceList = userForPricing.priceLists?.find(priceList => priceList.serviceType === accountType);

    if (!userPriceList) {
      return {
        status: 'ERROR',
        message: PL_NOT_FOUND,
      };
    }

    const shippingCostRes = await getShippingCost(userPriceList.priceListId, weight, shipping.consignee!.address!.country);

    if (shippingCostRes.status !== 'OK') {
      return {
        status: 'ERROR',
        message: shippingMessages.COST_NOT_CALCULATED,
      };
    }

    const newShippingCost = shippingCostRes.data;

    const shippingCostDifference = newShippingCost - currentShippingCost;

    if (shippingCostDifference > 0) {
      await applyBalanceTransaction('SPEND', shipping.userId.toString(), shippingCostDifference, shipping._id.toString());
    } else if (shippingCostDifference < 0) {
      // Gerektiğinde PAY olarak girilebilir
    }

    shipping.package = {
      numberOfPackage: shipping.package?.numberOfPackage ?? 1,
      weight,
      width,
      height,
      length,
      volumetricWeight,
    };

    shipping.packageDimensionsUpdated = true;

    if (shipping.carrier) {
      shipping.carrier.amount = newShippingCost;
    }

    await shipping.save();

    return {
      status: 'OK',
      message: UPDATESHIPPING.SUCCESS,
    };
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      return {
        status: 'ERROR',
        message: error.errors.join(', '),
      };
    }
    if (error instanceof Error) {
      captureActionError('updatePackageDimensions', error);
    }
    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default updatePackageDimensions;
