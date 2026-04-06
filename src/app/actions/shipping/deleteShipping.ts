'use server';

import * as Sentry from '@sentry/nextjs';
import mongoose from 'mongoose';

import { generalMessages, shippingMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { Shipping } from '@/models';

const { UNAUTHORIZED, UNEXPECTED_ERROR } = generalMessages;
const { ALREADY_LABELED, DELETE, ID, NOT_FOUND } = shippingMessages;

const deleteShipping = async (shippingId: string): Promise<ResponseTypes.IActionResponse> => {
  try {
    await connectMongoDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        status: 'ERROR',
        message: UNAUTHORIZED,
      };
    }

    if (!mongoose.Types.ObjectId.isValid(shippingId)) {
      return {
        status: 'ERROR',
        message: ID.INVALID,
      };
    }
    const query: Record<string, unknown> = { _id: shippingId };

    if (currentUser.role === 'CUSTOMER') {
      query.userId = currentUser.id;
    }

    const shipping = await Shipping.findOne(query).select('carrier.trackingNumber').lean<{ carrier?: { trackingNumber?: string } }>();

    if (!shipping) {
      return {
        status: 'ERROR',
        message: NOT_FOUND,
      };
    }

    if (shipping.carrier?.trackingNumber) {
      return {
        status: 'ERROR',
        message: ALREADY_LABELED,
      };
    }

    const deleteResult = await Shipping.deleteOne(query);

    if (deleteResult.deletedCount === 0) {
      return {
        status: 'ERROR',
        message: NOT_FOUND,
      };
    }

    return {
      status: 'OK',
      message: DELETE.SUCCESS,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      Sentry.captureException(error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default deleteShipping;
