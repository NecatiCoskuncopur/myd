'use server';

import { messages } from '@/constants';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { PricingList, User } from '@/models';

const getUserPricingList = async (): Promise<IActionResponse<IPricingList>> => {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        status: 'ERROR',
        message: messages.GENERAL.UNAUTHORIZED,
      };
    }

    const user = await User.findById(currentUser.id).select('priceListId').lean();

    if (!user || !user.priceListId) {
      return {
        status: 'ERROR',
        message: messages.PRICINGLIST.USER_LIST_UNDEFINED,
      };
    }

    const pricingList = await PricingList.findById(user.priceListId).lean();

    if (!pricingList) {
      return {
        status: 'ERROR',
        message: messages.PRICINGLIST.NOT_FOUND,
      };
    }

    return {
      status: 'OK',
      data: pricingList,
    };
  } catch (error) {
    console.error('Get User Pricing List Error:', error);

    return {
      status: 'ERROR',
      message: error instanceof Error ? error.message : messages.GENERAL.UNEXPECTED_ERROR,
    };
  }
};

export default getUserPricingList;
