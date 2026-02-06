'use server';

import mongoose from 'mongoose';

import { getCurrentUser } from '@/lib/getCurrentUser';
import { Shipping } from '@/models';

export const getShipping = async (shippingId: string) => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error('Yetkisiz İşlem');
  }

  if (!mongoose.Types.ObjectId.isValid(shippingId)) {
    throw new Error('INVALID_SHIPPING_ID');
  }

  const shipping = await Shipping.findOne({
    _id: shippingId,
    ...(currentUser.role === 'CUSTOMER' ? { userId: currentUser.id } : {}),
  }).lean();

  if (!shipping) {
    throw new Error('SHIPPING_NOT_FOUND');
  }

  return shipping;
};

export default getShipping;
