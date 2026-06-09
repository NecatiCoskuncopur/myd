'use server';

import * as Sentry from '@sentry/nextjs';
import { Types } from 'mongoose';

import { generalMessages, pricingListMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import { PricingList, User } from '@/models';
import { revalidatePath } from 'next/cache';

const { NOT_FOUND } = pricingListMessages;
const { UNEXPECTED_ERROR } = generalMessages;

const deletePricingList = async (listId: string): Promise<ResponseTypes.IActionResponse> => {
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

    const pricingListDoc = await PricingList.findById(listId);

    if (!pricingListDoc) {
      return {
        status: 'ERROR',
        message: NOT_FOUND,
      };
    }

    if (pricingListDoc.isDefault) {
      return {
        status: 'ERROR',
        message: pricingListMessages.DELETE?.DEFAULT_ERROR,
      };
    }

    const defaultPricingList = await PricingList.findOne({ isDefault: true });

    if (!defaultPricingList) {
      return {
        status: 'ERROR',
        message: pricingListMessages.DELETE.DEFAULT_NOT_FOUND,
      };
    }

    await User.updateMany({ priceListId: listId }, { priceListId: defaultPricingList._id });

    await pricingListDoc.deleteOne();

    revalidatePath('/panel/yonetim/fiyat-listeleri');
    return {
      status: 'OK',
      message: pricingListMessages.DELETE.SUCCESS,
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

export default deletePricingList;
