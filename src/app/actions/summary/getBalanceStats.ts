'use server';

import * as Sentry from '@sentry/nextjs';
import { generalMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import mongoose from 'mongoose';
import { Balance } from '@/models';

export type YearlyStatsResponse = Record<number, SummaryTypes.ITransactionStats>;

interface ICombinedBalanceResponse {
  availableYears: number[];
  monthlyStats: YearlyStatsResponse;
}

const getBalanceDashboardData = async (selectedYear: number): Promise<ResponseTypes.IActionResponse<ICombinedBalanceResponse>> => {
  try {
    await connectMongoDB();
    const currentUser = await getCurrentUser();

    const startOfYear = new Date(selectedYear, 0, 1);
    const endOfYear = new Date(selectedYear + 1, 0, 1);

    const pipeline: any[] = [];

    if (currentUser?.role !== 'ADMIN' && currentUser?.role !== 'OPERATOR') {
      pipeline.push({
        $match: { userId: new mongoose.Types.ObjectId(currentUser?.id) },
      });
    }

    pipeline.push({ $unwind: '$transactions' });

    pipeline.push({
      $facet: {
        allYears: [
          {
            $group: {
              _id: { $year: '$transactions.createdAt' },
            },
          },
          { $sort: { _id: -1 } },
        ],
        filteredMonthlyStats: [
          {
            $match: {
              'transactions.createdAt': {
                $gte: startOfYear,
                $lt: endOfYear,
              },
            },
          },
          {
            $group: {
              _id: { $month: '$transactions.createdAt' },
              pay: {
                $sum: {
                  $cond: [{ $eq: ['$transactions.transactionType', 'PAY'] }, '$transactions.amount', 0],
                },
              },
              spend: {
                $sum: {
                  $cond: [{ $eq: ['$transactions.transactionType', 'SPEND'] }, '$transactions.amount', 0],
                },
              },
            },
          },
        ],
      },
    });

    const [facetResult] = await Balance.aggregate(pipeline);
    let availableYears: number[] = facetResult?.allYears?.map((item: any) => item._id) || [];

    if (availableYears.length === 0) {
      availableYears.push(new Date().getFullYear());
    }
    const monthlyStats: YearlyStatsResponse = {};
    for (let m = 1; m <= 12; m++) {
      monthlyStats[m] = { pay: 0, spend: 0, total: 0 };
    }
    facetResult?.filteredMonthlyStats?.forEach((item: any) => {
      if (item._id >= 1 && item._id <= 12) {
        monthlyStats[item._id] = {
          pay: item.pay,
          spend: item.spend,
          total: item.pay + item.spend,
        };
      }
    });

    return {
      status: 'OK',
      data: {
        availableYears,
        monthlyStats,
      },
    };
  } catch (error) {
    if (error instanceof Error) Sentry.captureException(error);
    return { status: 'ERROR', message: generalMessages.UNEXPECTED_ERROR };
  }
};

export default getBalanceDashboardData;
