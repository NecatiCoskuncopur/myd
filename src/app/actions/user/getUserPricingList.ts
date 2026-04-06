'use server';

import * as Sentry from '@sentry/nextjs';
import mongoose from 'mongoose';

import { generalMessages, pricingListMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { PricingList, User } from '@/models';

const { NOT_FOUND, USER_LIST_UNDEFINED } = pricingListMessages;
const { UNAUTHORIZED, UNEXPECTED_ERROR } = generalMessages;

const getUserPricingList = async (): Promise<ResponseTypes.IActionResponse<PricingListTypes.IPricingList>> => {
  try {
    await connectMongoDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { status: 'ERROR', message: UNAUTHORIZED };
    }

    const user = await User.findById(currentUser.id).select('priceListId').lean<{ priceListId?: mongoose.Types.ObjectId }>();

    const priceListId = user?.priceListId?.toString();

    if (!priceListId) {
      return { status: 'ERROR', message: USER_LIST_UNDEFINED };
    }

    const pricingListDoc = await PricingList.findById(priceListId).lean();
    if (!pricingListDoc) {
      return { status: 'ERROR', message: NOT_FOUND };
    }

    const pricingList: PricingListTypes.IPricingList = {
      _id: pricingListDoc._id.toString(),
      name: pricingListDoc.name,
      zone: pricingListDoc.zone.map((z: PricingListTypes.IZone) => ({
        number: z.number,
        prices: z.prices.map((p: PricingListTypes.IPrice) => ({ weight: p.weight ?? 0, price: p.price ?? 0 })),
        than: z.than,
      })),
      createdAt: pricingListDoc.createdAt.toISOString(),
      updatedAt: pricingListDoc.updatedAt.toISOString(),
    };

    return { status: 'OK', data: pricingList };
  } catch (error) {
    if (error instanceof Error) {
      Sentry.captureException(error);
    }

    return { status: 'ERROR', message: UNEXPECTED_ERROR };
  }
};

export default getUserPricingList;
