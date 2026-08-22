'use server';

import { Types } from 'mongoose';

import { generalMessages, shippingMessages, UserRole } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import serialize from '@/lib/serialize';
import { Shipping } from '@/models';
import { ShippingTypes } from '@/types/shipping';

const { UNAUTHORIZED, UNEXPECTED_ERROR } = generalMessages;
const { ID, NOT_FOUND } = shippingMessages;

const getShipping = async (shippingId: string): Promise<ResponseTypes.IActionResponse<ShippingTypes.IShipping>> => {
  try {
    if (!Types.ObjectId.isValid(shippingId)) {
      return {
        status: 'ERROR',
        message: ID.INVALID,
      };
    }

    await connectMongoDB();

    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return {
        status: 'ERROR',
        message: UNAUTHORIZED,
      };
    }

    const objectId = new Types.ObjectId(shippingId);

    const query = {
      _id: objectId,
      ...(currentUser.role === UserRole.CUSTOMER && {
        userId: currentUser.id,
      }),
    };

    const shipping = await Shipping.findOne(query).lean();

    if (!shipping) {
      return {
        status: 'ERROR',
        message: NOT_FOUND,
      };
    }

    return {
      status: 'OK',
      data: serialize<ShippingTypes.IShipping>(shipping),
    };
  } catch (error) {
    if (error instanceof Error) {
      captureActionError('getShipping', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default getShipping;
