'use server';

import { getCurrentUser } from '@/lib/getCurrentUser';
import { Shipping } from '@/models';

interface DeleteShippingParams {
  shippingId: string;
}

const deleteShipping = async ({ shippingId }: DeleteShippingParams) => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error('Yetkisiz İşlem');
  }

  const deleted = await Shipping.findOne({
    _id: shippingId,
    userId: currentUser.id,
  });
  if (!deleted) throw new Error('SHIPPING_NOT_FOUND');

  if (deleted.carrier?.trackingNumber) {
    throw new Error('SHIPPING_IS_LABELED');
  } else {
    await deleted.remove();
  }

  return {
    status: 'OK',
  };
};

export default deleteShipping;
