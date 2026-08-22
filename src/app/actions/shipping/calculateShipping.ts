'use server';

import { ValidationError } from 'yup';

import { generalMessages, pricingListMessages } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import getShippingCost from '@/lib/getShippingCost';
import { User } from '@/models';
import calculateShippingSchema from '@/schemas/calculateShipping.schema';
import { ShippingTypes } from '@/types/shipping';

const { UNAUTHORIZED, UNEXPECTED_ERROR } = generalMessages;
const { NOT_FOUND, USER_LIST_UNDEFINED } = pricingListMessages;

const calculateShipping = async (data: ShippingTypes.ICalculateShippingPayload): Promise<ResponseTypes.IActionResponse<number>> => {
  try {
    const validatedData = await calculateShippingSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    await connectMongoDB();

    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return {
        status: 'ERROR',
        message: UNAUTHORIZED,
      };
    }

    const user = await User.findById(currentUser.id).select('priceLists').lean();

    if (!user?.priceLists?.length) {
      return {
        status: 'ERROR',
        message: USER_LIST_UNDEFINED,
      };
    }

    const userPricingList = user.priceLists.find(item => item.serviceType === validatedData.serviceType);

    if (!userPricingList) {
      return {
        status: 'ERROR',
        message: NOT_FOUND,
      };
    }

    const result = await getShippingCost(userPricingList.priceListId, validatedData.weight, validatedData.countryCode);

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
      captureActionError('calculateShipping', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default calculateShipping;
