'use server';

import { Types } from 'mongoose';

import { generalMessages, pricingListMessages, UserRole } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import { PricingList, User } from '@/models';

const { DELETE, NOT_FOUND } = pricingListMessages;
const { UNEXPECTED_ERROR } = generalMessages;

const deletePricingList = async (listId: string): Promise<ResponseTypes.IActionResponse> => {
  try {
    const authError = await requireRoles([UserRole.ADMIN, UserRole.OPERATOR]);

    if (authError) {
      return authError;
    }

    if (!Types.ObjectId.isValid(listId)) {
      return {
        status: 'ERROR',
        message: NOT_FOUND,
      };
    }

    await connectMongoDB();

    const priceListId = new Types.ObjectId(listId);

    const pricingList = await PricingList.findById(priceListId).select('_id').lean();

    if (!pricingList) {
      return {
        status: 'ERROR',
        message: NOT_FOUND,
      };
    }

    await User.updateMany(
      {
        'priceLists.priceListId': priceListId,
      },
      {
        $pull: {
          priceLists: {
            priceListId,
          },
        },
      },
    );

    const deleteResult = await PricingList.deleteOne({
      _id: priceListId,
    });

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
  } catch (error) {
    if (error instanceof Error) {
      captureActionError('deletePricingList', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default deletePricingList;
