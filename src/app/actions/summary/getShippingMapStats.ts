'use server';

import * as Sentry from '@sentry/nextjs';
import { generalMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { Shipping } from '@/models';
import { getCurrentUser } from '@/lib/getCurrentUser';
import mongoose from 'mongoose';

const getShippingMapStats = async (): Promise<ResponseTypes.IActionResponse<SummaryTypes.IHeatMap>> => {
  try {
    await connectMongoDB();
    const currentUser = await getCurrentUser();

    const pipeline: any[] = [];

    if (currentUser?.role !== 'ADMIN' && currentUser?.role !== 'OPERATOR') {
      pipeline.push({
        $match: { userId: new mongoose.Types.ObjectId(currentUser?.id) },
      });
    }

    pipeline.push({
      $group: {
        _id: '$consignee.address.country',
        count: { $sum: 1 },
      },
    });

    const aggregateResult = await Shipping.aggregate(pipeline);
    const formattedData = aggregateResult.reduce((acc, item) => {
      if (item._id) {
        const countryKey = item._id.toUpperCase();
        acc[countryKey] = item.count;
      }
      return acc;
    }, {} as SummaryTypes.IHeatMap);

    return {
      status: 'OK',
      data: formattedData,
    };
  } catch (error) {
    if (error instanceof Error) Sentry.captureException(error);
    return { status: 'ERROR', message: generalMessages.UNEXPECTED_ERROR };
  }
};

export default getShippingMapStats;
