'use server';

import * as Sentry from '@sentry/nextjs';
import { ValidationError } from 'yup';

import { generalMessages, pricingListMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import getShippingCost from '@/lib/getShippingCost';
import { User } from '@/models';
import calculateShippingSchema from '@/schemas/calculateShipping.schema';

const { UNAUTHORIZED, UNEXPECTED_ERROR } = generalMessages;
const { NOT_FOUND } = pricingListMessages;

const calculateShipping = async (data: ShippingTypes.ICalculateShippingPayload): Promise<ResponseTypes.IActionResponse<number>> => {
  try {
    await connectMongoDB();

    const validatedData = await calculateShippingSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        status: 'ERROR',
        message: UNAUTHORIZED,
      };
    }

    const user = await User.findById(currentUser.id).select('priceListId').lean<{ priceListId: string }>();

    if (!user?.priceListId) {
      return {
        status: 'ERROR',
        message: NOT_FOUND,
      };
    }

    const result = await getShippingCost(user.priceListId, validatedData.weight, validatedData.countryCode);

    if (result.status === 'ERROR') {
      return {
        status: 'ERROR',
        message: result.message,
      };
    }

    return {
      status: 'OK',
      data: result.data,
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        status: 'ERROR',
        message: error.errors.join(', '),
      };
    }

    if (error instanceof Error) {
      Sentry.captureException(error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default calculateShipping;
