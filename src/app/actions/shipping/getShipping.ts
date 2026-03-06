'use server';

import mongoose from 'mongoose';

import { messages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { Shipping } from '@/models';

const { GENERAL, SHIPPING } = messages;

const getShipping = async (shippingId: string): Promise<IActionResponse<IShipping>> => {
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

    const shipping = await Shipping.findOne(query).lean<IShipping>();

    if (!shipping) {
      return {
        status: 'ERROR',
        message: SHIPPING.NOT_FOUND,
      };
    }

    return {
      status: 'OK',
      data: shipping,
    };
  } catch {
    return {
      status: 'ERROR',
      message: GENERAL.UNEXPECTED_ERROR,
    };
  }
};

export default getShipping;
