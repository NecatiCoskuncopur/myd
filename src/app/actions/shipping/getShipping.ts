'use server';

import * as Sentry from '@sentry/nextjs';
import mongoose from 'mongoose';

import { generalMessages, shippingMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { Shipping } from '@/models';

const { UNAUTHORIZED, UNEXPECTED_ERROR } = generalMessages;
const { ID, NOT_FOUND } = shippingMessages;

const getShipping = async (shippingId: string): Promise<ResponseTypes.IActionResponse<ShippingTypes.IShipping>> => {
  try {
    if (!mongoose.Types.ObjectId.isValid(shippingId)) {
      return { status: 'ERROR', message: ID.INVALID };
    }

    await connectMongoDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { status: 'ERROR', message: UNAUTHORIZED };
    }

    const query: Record<string, unknown> = { _id: shippingId };

    if (currentUser.role === 'CUSTOMER') {
      query.userId = currentUser.id;
    }

    const shipping = await Shipping.findOne(query).lean<ShippingTypes.IShipping>();

    if (!shipping) {
      return { status: 'ERROR', message: NOT_FOUND };
    }

    return {
      status: 'OK',
      data: JSON.parse(JSON.stringify(shipping)),
    };
  } catch (error) {
    if (error instanceof Error) Sentry.captureException(error);
    console.error('getShipping error:', error);
    return { status: 'ERROR', message: UNEXPECTED_ERROR };
  }
};

export default getShipping;
