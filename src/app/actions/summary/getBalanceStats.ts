'use server';

import * as Sentry from '@sentry/nextjs';
import mongoose from 'mongoose';

import { generalMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { Transaction } from '@/models';

export type YearlyStatsResponse = Record<number, SummaryTypes.ITransactionStats>;

interface ICombinedBalanceResponse {
  availableYears: number[];
  monthlyStats: YearlyStatsResponse;
}

const getBalanceDashboardData = async (selectedYear: number): Promise<ResponseTypes.IActionResponse<ICombinedBalanceResponse>> => {
  try {
    await connectMongoDB();
    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return {
        status: 'ERROR',
        message: generalMessages.UNAUTHORIZED,
      };
    }

    const startOfYear = new Date(selectedYear, 0, 1);
    const endOfYear = new Date(selectedYear + 1, 0, 1);

    const baseMatch: Record<string, any> = {};

    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'OPERATOR') {
      baseMatch.userId = new mongoose.Types.ObjectId(currentUser.id);
    }

    const pipeline: mongoose.PipelineStage[] = [
      { $match: baseMatch },
      {
        $facet: {
          allYears: [
            {
              $group: {
                _id: { $year: '$createdAt' },
              },
            },
            { $sort: { _id: -1 } },
          ],
          filteredMonthlyStats: [
            {
              $match: {
                createdAt: {
                  $gte: startOfYear,
                  $lt: endOfYear,
                },
              },
            },
            {
              $group: {
                _id: { $month: '$createdAt' },
                pay: {
                  $sum: {
                    $cond: [{ $eq: ['$transactionType', 'PAY'] }, '$amount', 0],
                  },
                },
                spend: {
                  $sum: {
                    $cond: [{ $eq: ['$transactionType', 'SPEND'] }, '$amount', 0],
                  },
                },
              },
            },
          ],
        },
      },
    ];

    const [facetResult] = await Transaction.aggregate(pipeline);

    const availableYears: number[] = facetResult?.allYears?.map((item: { _id: number }) => item._id).filter(Boolean) || [];

    if (availableYears.length === 0) {
      availableYears.push(new Date().getFullYear());
    }
    const monthlyStats: YearlyStatsResponse = {};
    for (let m = 1; m <= 12; m++) {
      monthlyStats[m] = { pay: 0, spend: 0, total: 0 };
    }

    facetResult?.filteredMonthlyStats?.forEach((item: { _id: number; pay: number; spend: number }) => {
      if (item._id >= 1 && item._id <= 12) {
        const pay = Math.round((item.pay + Number.EPSILON) * 100) / 100;
        const spend = Math.round((item.spend + Number.EPSILON) * 100) / 100;

        monthlyStats[item._id] = {
          pay,
          spend,
          total: Math.round((pay - spend + Number.EPSILON) * 100) / 100,
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
