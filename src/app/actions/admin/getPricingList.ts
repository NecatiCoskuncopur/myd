'use server';

import { Types } from 'mongoose';

import { messages } from '@/constants';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import { PricingList } from '@/models';

const { GENERAL, PRICINGLIST } = messages;

const getPricingList = async (listId: string): Promise<IActionResponse<IPricingList>> => {
  try {
    const authError = await requireRoles(['OPERATOR', 'ADMIN']);
    if (authError) return authError;

    if (!Types.ObjectId.isValid(listId)) {
      return {
        status: 'ERROR',
        message: PRICINGLIST.NOT_FOUND,
      };
    }
    await connectMongoDB();

    const pricingListDoc = await PricingList.findById(listId).lean<IPricingList>();

    if (!pricingListDoc) {
      return {
        status: 'ERROR',
        message: PRICINGLIST.NOT_FOUND,
      };
    }

    const pricingList: IPricingList = {
      _id: pricingListDoc._id.toString(),
      name: pricingListDoc.name,
      zone: pricingListDoc.zone.map((z: IZone) => ({
        number: z.number,
        prices: z.prices.map((p: IPrice) => ({ weight: p.weight, price: p.price })),
        than: z.than,
      })),
      createdAt: pricingListDoc.createdAt,
      updatedAt: pricingListDoc.updatedAt,
    };

    return {
      status: 'OK',
      data: pricingList,
    };
  } catch {
    return {
      status: 'ERROR',
      message: GENERAL.UNEXPECTED_ERROR,
    };
  }
};

export default getPricingList;
