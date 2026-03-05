'use server';

import moment from 'moment';
import mongoose from 'mongoose';

import { messages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { Shipping } from '@/models';

const { GENERAL, SHIPPING } = messages;

const shippingsStats = async (params: IShippingStatsParams): Promise<IActionResponse<IShippingStats>> => {
  try {
    await connectMongoDB();

    if (!['monthly', 'yearly'].includes(params.type)) {
      return { status: 'ERROR', message: SHIPPING.INVALID_STATS_TYPE };
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { status: 'ERROR', message: GENERAL.UNAUTHORIZED };
    }

    const { type } = params;
    const keys: string[] = [];
    const today = moment().endOf('day');
    let startDate: Date;

    if (type === 'monthly') {
      startDate = moment(today).subtract(29, 'days').startOf('day').toDate();
      for (let i = 0; i < 30; i++) {
        keys.push(moment(today).subtract(i, 'days').format('YYYY-MM-DD'));
      }
    } else {
      startDate = moment(today).subtract(11, 'months').startOf('month').toDate();
      for (let i = 0; i < 12; i++) {
        keys.push(moment(today).subtract(i, 'months').format('YYYY-MM'));
      }
    }
    keys.reverse();

    const shippingResults = await Shipping.aggregate<{
      _id: string;
      count: number;
    }>([
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
              timezone: 'Europe/Istanbul',
            },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const statsMap = shippingResults.reduce<Record<string, number>>((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    return {
      status: 'OK',
      data: {
        keys,
        datas: keys.map(key => statsMap[key] || 0),
      },
    };
  } catch {
    return { status: 'ERROR', message: GENERAL.UNEXPECTED_ERROR };
  }
};

export default shippingsStats;
