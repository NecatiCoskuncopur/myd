'use server';

import mongoose from 'mongoose';

import { messages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { PricingList, User } from '@/models';

const { GENERAL, PRICINGLIST } = messages;

const getUserPricingList = async (): Promise<IActionResponse<IPricingList>> => {
  try {
    await connectMongoDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { status: 'ERROR', message: GENERAL.UNAUTHORIZED };
    }

    const user = await User.findById(currentUser.id).select('priceListId').lean<{ priceListId?: mongoose.Types.ObjectId }>();

    const priceListId = user?.priceListId?.toString();

    if (!priceListId) {
      return { status: 'ERROR', message: PRICINGLIST.USER_LIST_UNDEFINED };
    }

    const pricingListDoc = await PricingList.findById(priceListId).lean();
    if (!pricingListDoc) {
      return { status: 'ERROR', message: PRICINGLIST.NOT_FOUND };
    }

    const pricingList: IPricingList = {
      _id: pricingListDoc._id.toString(),
      name: pricingListDoc.name,
      zone: pricingListDoc.zone.map((z: IZone) => ({
        number: z.number,
        prices: z.prices.map((p: IPrice) => ({ weight: p.weight, price: p.price })),
        than: z.than,
      })),
    };

    return { status: 'OK', data: pricingList };
  } catch {
    return { status: 'ERROR', message: GENERAL.UNEXPECTED_ERROR };
  }
};

export default getUserPricingList;
