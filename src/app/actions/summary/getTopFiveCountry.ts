'use server';

import * as Sentry from '@sentry/nextjs';
import { generalMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import mongoose from 'mongoose';
import { Shipping } from '@/models';

const getTopFiveCountry = async (): Promise<ResponseTypes.IActionResponse<SummaryTypes.IGetTopFiveCountry[]>> => {
  try {
    await connectMongoDB();

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return { status: 'ERROR', message: 'Yetkisiz erişim' };
    }

    const pipeline: mongoose.PipelineStage[] = [];

    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'OPERATOR') {
      pipeline.push({
        $match: { userId: new mongoose.Types.ObjectId(currentUser.id) },
      });
    }

    pipeline.push(
      {
        $group: {
          _id: '$consignee.address.country',
          totalShippings: { $sum: 1 },
        },
      },
      {
        $sort: {
          totalShippings: -1,
        },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          _id: 0,
          country: '$_id',
          totalShippings: 1,
          value: '$totalShippings',
        },
      },
    );

    const stats = (await Shipping.aggregate(pipeline)) as SummaryTypes.IGetTopFiveCountry[];

    return {
      status: 'OK',
      data: stats,
    };
  } catch (error) {
    if (error instanceof Error) Sentry.captureException(error);
    return { status: 'ERROR', message: generalMessages.UNEXPECTED_ERROR };
  }
};

export default getTopFiveCountry;
