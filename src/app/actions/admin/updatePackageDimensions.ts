'use server';

import requireRoles from '@/lib/requireRoles';
import { generalMessages, pricingListMessages, shippingMessages, ShippingStatus, UserRole } from '@/constants';
import updatePackageDimensionsSchema from '@/schemas/updatePackageDimensions.schema';
import { AdminTypes } from '@/types/admin';
import { ValidationError } from 'yup';
import * as Sentry from '@sentry/nextjs';
import { Shipping, User } from '@/models';
import getShippingCost from '@/lib/getShippingCost';
import applyBalanceTransaction from '@/lib/applyBalanceTransaction';

const { UNEXPECTED_ERROR } = generalMessages;
const { NOT_FOUND, UPDATESHIPPING } = shippingMessages;

const updatePackageDimensions = async (data: AdminTypes.IUpdatePackageDimensionsPayload): Promise<ResponseTypes.IActionResponse> => {
  try {
    const authError = await requireRoles([UserRole.ADMIN, UserRole.OPERATOR]);
    if (authError) return authError;

    const validatedData = await updatePackageDimensionsSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    const { shippingId, weight, numberOfPackage, width, height, length } = validatedData;

    const volumetricWeight = (length * width * height) / 5000;

    const shipping = await Shipping.findById(shippingId);

    if (!shipping) {
      return {
        status: 'ERROR',
        message: NOT_FOUND,
      };
    }

    if (shipping.status !== ShippingStatus.LABELED) {
      shipping.package = {
        weight,
        width,
        height,
        length,
        volumetricWeight,
        numberOfPackage,
      };
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
        message: pricingListMessages.PRICING.USER_NOT_FOUND,
      };
    }

    const shippingCostRes = await getShippingCost(userForPricing.priceListId!, weight, shipping.consignee!.address!.country);

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
      weight,
      width,
      height,
      length,
      volumetricWeight,
      numberOfPackage,
    };

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
      Sentry.withScope(scope => {
        scope.setTag('action', 'updatePackageDimensions');
        scope.captureException(error);
      });
    }
    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default updatePackageDimensions;
