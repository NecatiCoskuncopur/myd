'use server';

import mongoose from 'mongoose';

import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { Shipping } from '@/models';

const heatMap = async (): Promise<IHeatMap[]> => {
  await connectMongoDB();
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error('Yetkisiz İşlem');
  }

  const shipping = await Shipping.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(currentUser.id),
      },
    },
    {
      $group: {
        _id: '$consignee.address.country',
        count: { $sum: 1 },
      },
    },
  ]);

  return shipping.map(item => ({
    country: item._id,
    value: item.count,
  }));
};

export default heatMap;
