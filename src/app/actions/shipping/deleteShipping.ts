'use server';

import mongoose from 'mongoose';

import { messages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { Shipping } from '@/models';

const { GENERAL, SHIPPING } = messages;

const deleteShipping = async (shippingId: string): Promise<IActionResponse> => {
  try {
    await connectMongoDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        status: 'ERROR',
        message: GENERAL.UNAUTHORIZED,
      };
    }

    if (!mongoose.Types.ObjectId.isValid(shippingId)) {
      return {
        status: 'ERROR',
        message: SHIPPING.INVALID_ID,
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
        message: SHIPPING.NOT_FOUND,
      };
    }

    if (shipping.carrier?.trackingNumber) {
      return {
        status: 'ERROR',
        message: SHIPPING.ALREADY_LABELED,
      };
    }

    await Shipping.deleteOne({ _id: shippingId });

    return {
      status: 'OK',
      message: SHIPPING.DELETE_SUCCESS,
    };
  } catch {
    return {
      status: 'ERROR',
      message: GENERAL.UNEXPECTED_ERROR,
    };
  }
};

export default deleteShipping;
