'use server';

import { Types } from 'mongoose';

import { messages } from '@/constants';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import { PricingList } from '@/models';

const getPricingList = async (listId: string): Promise<IActionResponse<IPricingList>> => {
  try {
    const authError = await requireRoles(['OPERATOR', 'ADMIN']);
    if (authError) return authError;

    if (!Types.ObjectId.isValid(listId)) {
      return {
        status: 'ERROR',
        message: messages.PRICINGLIST.NOT_FOUND,
      };
    }
    await connectMongoDB();

    const list = await PricingList.findById(listId).lean<IPricingList>();

    if (!list) {
      return {
        status: 'ERROR',
        message: messages.PRICINGLIST.NOT_FOUND,
      };
    }

    return {
      status: 'OK',
      data: list,
    };
  } catch (error) {
    console.error('Get Pricing List Error:', error);

    return {
      status: 'ERROR',
      message: messages.GENERAL.UNEXPECTED_ERROR,
    };
  }
};

export default getPricingList;
