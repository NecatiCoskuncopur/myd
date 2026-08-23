'use server';

import { Types } from 'mongoose';

import { generalMessages, pricingListMessages, UserRole } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import { PricingList } from '@/models';
import { PricingListTypes } from '@/types/pricingList';

const { NOT_FOUND } = pricingListMessages;
const { UNEXPECTED_ERROR } = generalMessages;

const getPricingList = async (listId: string): Promise<ResponseTypes.IActionResponse<PricingListTypes.IPricingList>> => {
  try {
    const authError = await requireRoles([UserRole.ADMIN, UserRole.OPERATOR]);
    if (authError) return authError;

    if (!Types.ObjectId.isValid(listId)) {
      return {
        status: 'ERROR',
        message: NOT_FOUND,
      };
    }
    await connectMongoDB();

    const pricingListData = await PricingList.findById(listId).lean();
    if (!pricingListData) {
      return {
        status: 'ERROR',
        message: NOT_FOUND,
      };
    }

    const pricingList: PricingListTypes.IPricingList = {
      _id: pricingListData._id.toString(),
      name: pricingListData.name,
      listType: pricingListData.listType,
      zone: pricingListData.zone.map(zone => ({
        number: zone.number,
        prices: zone.prices.map(price => ({
          weight: price.weight,
          price: price.price,
        })),
        than: zone.than,
      })),
      createdAt: pricingListData.createdAt.toISOString(),
      updatedAt: pricingListData.updatedAt.toISOString(),
    };

    return {
      status: 'OK',
      data: pricingList,
    };
  } catch (error) {
    if (error instanceof Error) {
      captureActionError('getPricingList', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default getPricingList;
