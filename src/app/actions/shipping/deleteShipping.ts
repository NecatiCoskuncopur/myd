'use server';

import { Types } from 'mongoose';

import { generalMessages, shippingMessages, ShippingStatus, UserRole } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { Shipping } from '@/models';

const { UNAUTHORIZED, UNEXPECTED_ERROR } = generalMessages;
const { ALREADY_LABELED, DELETE, ID, NOT_FOUND } = shippingMessages;

const deleteShipping = async (shippingId: string): Promise<ResponseTypes.IActionResponse> => {
  try {
    await connectMongoDB();

    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return {
        status: 'ERROR',
        message: UNAUTHORIZED,
      };
    }

    if (!Types.ObjectId.isValid(shippingId)) {
      return {
        status: 'ERROR',
        message: ID.INVALID,
      };
    }

    const objectId = new Types.ObjectId(shippingId);
    const query = {
      _id: objectId,
      ...(currentUser.role === UserRole.CUSTOMER && {
        userId: currentUser.id,
      }),
    };

    const shipping = await Shipping.findOne(query).select('carrier.trackingNumber status').lean();

    if (!shipping) {
      return {
        status: 'ERROR',
        message: NOT_FOUND,
      };
    }

    if (shipping.carrier?.trackingNumber || shipping.status === ShippingStatus.LABELED) {
      return {
        status: 'ERROR',
        message: ALREADY_LABELED,
      };
    }

    const deleteResult = await Shipping.deleteOne({
      ...query,
      status: { $ne: ShippingStatus.LABELED },
    });

    if (deleteResult.deletedCount === 0) {
      return {
        status: 'ERROR',
        message: ALREADY_LABELED,
      };
    }
    return {
      status: 'OK',
      message: DELETE.SUCCESS,
    };
  } catch (error) {
    if (error instanceof Error) {
      captureActionError('deleteShipping', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default deleteShipping;
