'use server';

import * as Sentry from '@sentry/nextjs';
import { generalMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import mongoose from 'mongoose';

import { Balance } from '@/models';

const getBalanceStats = async (): Promise<ResponseTypes.IActionResponse<SummaryTypes.IBalanceStats>> => {
  try {
    await connectMongoDB();
    const currentUser = await getCurrentUser();

    const now = new Date();

    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const pipeline = [];

    if (currentUser?.role !== 'ADMIN' && currentUser?.role !== 'OPERATOR') {
      pipeline.push({
        $match: { userId: new mongoose.Types.ObjectId(currentUser?.id) },
      });
    }

    pipeline.push({ $unwind: '$transactions' });

    pipeline.push({
      $match: {
        'transactions.createdAt': { $gte: startOfYear },
      },
    });

    pipeline.push({
      $group: {
        _id: null,

        dailyPay: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$transactions.transactionType', 'PAY'] }, { $gte: ['$transactions.createdAt', startOfDay] }] },
              '$transactions.amount',
              0,
            ],
          },
        },
        dailySpend: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$transactions.transactionType', 'SPEND'] }, { $gte: ['$transactions.createdAt', startOfDay] }] },
              '$transactions.amount',
              0,
            ],
          },
        },

        monthlyPay: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$transactions.transactionType', 'PAY'] }, { $gte: ['$transactions.createdAt', startOfMonth] }] },
              '$transactions.amount',
              0,
            ],
          },
        },
        monthlySpend: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$transactions.transactionType', 'SPEND'] }, { $gte: ['$transactions.createdAt', startOfMonth] }] },
              '$transactions.amount',
              0,
            ],
          },
        },

        yearlyPay: {
          $sum: {
            $cond: [{ $eq: ['$transactions.transactionType', 'PAY'] }, '$transactions.amount', 0],
          },
        },
        yearlySpend: {
          $sum: {
            $cond: [{ $eq: ['$transactions.transactionType', 'SPEND'] }, '$transactions.amount', 0],
          },
        },
      },
    });

    pipeline.push({
      $project: {
        _id: 0,
        daily: {
          pay: '$dailyPay',
          spend: '$dailySpend',
          total: { $add: ['$dailyPay', '$dailySpend'] },
        },
        monthly: {
          pay: '$monthlyPay',
          spend: '$monthlySpend',
          total: { $add: ['$monthlyPay', '$monthlySpend'] },
        },
        yearly: {
          pay: '$yearlyPay',
          spend: '$yearlySpend',
          total: { $add: ['$yearlyPay', '$yearlySpend'] },
        },
      },
    });

    const stats = await Balance.aggregate(pipeline);

    const defaultStats: SummaryTypes.IBalanceStats = {
      daily: { pay: 0, spend: 0, total: 0 },
      monthly: { pay: 0, spend: 0, total: 0 },
      yearly: { pay: 0, spend: 0, total: 0 },
    };

    return {
      status: 'OK',
      data: stats.length > 0 ? stats[0] : defaultStats,
    };
  } catch (error) {
    if (error instanceof Error) Sentry.captureException(error);
    return { status: 'ERROR', message: generalMessages.UNEXPECTED_ERROR };
  }
};

export default getBalanceStats;
