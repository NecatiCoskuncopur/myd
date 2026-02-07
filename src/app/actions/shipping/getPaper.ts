'use server';

import mongoose from 'mongoose';

import { getCurrentUser } from '@/lib/getCurrentUser';
import { Storage } from '@/lib/storage';
import { Shipping } from '@/models';

type GetPaperParams = {
  shippingId: string;
  type: 'labels' | 'invoices';
};

export const getPaper = async ({ shippingId, type }: GetPaperParams): Promise<Buffer> => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error('Yetkisiz İşlem');
  }

  if (type !== 'labels' && type !== 'invoices') {
    throw new Error('WRONG_TYPE');
  }

  let paper;

  if (currentUser.role === 'ADMIN' || currentUser.role === 'OPERATOR') {
    paper = await Storage.getObject({
      Key: `${shippingId}.pdf`,
      Bucket: type,
    });
  } else {
    const shipping = await Shipping.findOne({
      _id: new mongoose.Types.ObjectId(shippingId),
      userId: new mongoose.Types.ObjectId(currentUser.id),
    });

    if (!shipping) {
      throw new Error('PAPER_NOT_FOUND');
    }

    paper = await Storage.getObject({
      Key: `${shippingId}.pdf`,
      Bucket: type,
    });
  }

  if (!paper?.Body) {
    throw new Error('EMPTY_FILE');
  }

  return paper.Body as Buffer;
};
