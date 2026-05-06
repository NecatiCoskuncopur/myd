'use server';

import * as Sentry from '@sentry/nextjs';
import { Types } from 'mongoose';

import { generalMessages, pricingListMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import { PricingList } from '@/models';

const { NOT_FOUND } = pricingListMessages;
const { UNEXPECTED_ERROR } = generalMessages;

const getPricingList = async (listId: string): Promise<ResponseTypes.IActionResponse<PricingListTypes.IPricingList>> => {
  try {
    const authError = await requireRoles(['OPERATOR', 'ADMIN']);
    if (authError) return authError;

    if (!Types.ObjectId.isValid(listId)) {
      return {
        status: 'ERROR',
        message: NOT_FOUND,
      };
    }
    await connectMongoDB();

    const pricingListDoc = await PricingList.findById(listId).lean<PricingListTypes.IPricingList>();

    if (!pricingListDoc) {
      return {
        status: 'ERROR',
        message: NOT_FOUND,
      };
    }

    const pricingList: PricingListTypes.IPricingList = {
      _id: pricingListDoc._id.toString(),
      name: pricingListDoc.name,
      zone: pricingListDoc.zone.map((z: PricingListTypes.IZone) => ({
        number: z.number,
        prices: z.prices.map((p: PricingListTypes.IPrice) => ({ weight: p.weight, price: p.price })),
        than: z.than,
      })),
      createdAt: pricingListDoc.createdAt,
      updatedAt: pricingListDoc.updatedAt,
    };

    return {
      status: 'OK',
      data: pricingList,
    };
  } catch (error) {
    if (error instanceof Error) {
      Sentry.captureException(error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default getPricingList;
