'use server';

import * as Sentry from '@sentry/nextjs';
import { generalMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import mongoose from 'mongoose';
import { Shipping } from '@/models';

const getShippingStats = async (): Promise<ResponseTypes.IActionResponse<SummaryTypes.IShippingStats>> => {
  try {
    await connectMongoDB();
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return { status: 'ERROR', message: generalMessages.UNAUTHORIZED };
    }

    const pipeline: any[] = [];

    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'OPERATOR') {
      pipeline.push({
        $match: { userId: new mongoose.Types.ObjectId(currentUser.id) },
      });
    }

    pipeline.push({
      $match: {
        status: { $in: ['CREATED', 'LABELED', 'CANCELLED'] },
      },
    });

    pipeline.push({
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    });

    pipeline.push({
      $group: {
        _id: null,
        stats: {
          $push: {
            k: '$_id',
            v: '$count',
          },
        },
      },
    });

    pipeline.push({
      $replaceRoot: {
        newRoot: { $arrayToObject: '$stats' },
      },
    });

    const result = await Shipping.aggregate(pipeline);
    const defaultData = { CREATED: 0, LABELED: 0, CANCELLED: 0 };
    const dbData = result.length > 0 ? result[0] : {};
    const mergedData: Record<string, number> = { ...defaultData, ...dbData };
    const totalCount = Object.values(mergedData).reduce((sum, value) => sum + value, 0);

    const finalData: SummaryTypes.IShippingStats = {
      ...mergedData,
      CREATED: mergedData.CREATED,
      LABELED: mergedData.LABELED,
      CANCELLED: mergedData.CANCELLED,
      TOTAL: totalCount,
    };

    return {
      status: 'OK',
      data: finalData,
    };
  } catch (error) {
    if (error instanceof Error) Sentry.captureException(error);
    return { status: 'ERROR', message: generalMessages.UNEXPECTED_ERROR };
  }
};

export default getShippingStats;
