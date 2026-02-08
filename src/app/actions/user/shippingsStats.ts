'use server';

import moment from 'moment';
import mongoose from 'mongoose';

import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { Shipping } from '@/models';

type ShippingStatsType = 'monthly' | 'yearly';

const shippingsStats = async (type: ShippingStatsType): Promise<IShippingStats> => {
  await connectMongoDB();
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error('Yetkisiz İşlem');
  }

  if (type !== 'monthly' && type !== 'yearly') {
    throw new Error('WRONG_TYPE');
  }

  let startDate: Date;
  const keys: string[] = [];
  const today = moment();

  if (type === 'monthly') {
    startDate = moment().subtract(1, 'months').toDate();

    for (let i = 0; i < 30; i++) {
      keys.unshift(moment(today).subtract(i, 'days').format('YYYY-MM-DD'));
    }
  } else {
    startDate = moment().subtract(1, 'years').toDate();

    for (let i = 0; i < 12; i++) {
      keys.unshift(moment(today).subtract(i, 'months').format('YYYY-MM'));
    }
  }

  const shipping = await Shipping.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(currentUser.id),
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: type === 'monthly' ? '%Y-%m-%d' : '%Y-%m',
            date: '$createdAt',
          },
        },
        count: { $sum: 1 },
      },
    },
  ]);

  return {
    keys,
    datas: keys.map(date => {
      const found = shipping.find(item => item._id === date);
      return found?.count ?? 0;
    }),
  };
};

export default shippingsStats;
