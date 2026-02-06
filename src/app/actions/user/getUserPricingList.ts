'use server';

import { getCurrentUser } from '@/lib/getCurrentUser';
import { PricingList, User } from '@/models';

export const getUserPricingList = async () => {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error('Yetkisiz İşlem');
  }

  const { priceListId } = await User.findById(currentUser?.id);

  if (!priceListId) throw new Error('USER_PRICING_LIST_NOT_DEFINED');

  const pricingList = await PricingList.findById(priceListId);

  if (!pricingList) throw new Error('PRICING_LIST_NOT_FOUND');

  return pricingList;
};
