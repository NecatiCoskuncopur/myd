'use server';

import { getCurrentUser } from '@/lib/getCurrentUser';
import getShippingCost from '@/lib/getShippingCost';
import { User } from '@/models';

interface CalculateShippingParams {
  weight: number;
  countryCode: string;
}

const calculateShipping = async ({ weight, countryCode }: CalculateShippingParams): Promise<number> => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error('Yetkisiz İşlem');
  }

  const user = await User.findById(currentUser.id).select('priceListId').lean<{ priceListId: string }>();

  if (!user?.priceListId) {
    throw new Error('PRICE_LIST_NOT_FOUND');
  }

  const result = await getShippingCost(user.priceListId, weight, countryCode);

  return result;
};

export default calculateShipping;
