'use server';

import * as Sentry from '@sentry/nextjs';
import { generalMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import mongoose from 'mongoose';
import { Shipping } from '@/models';
import requireRoles from '@/lib/requireRoles';

const getTopFiveUser = async (): Promise<ResponseTypes.IActionResponse<SummaryTypes.IGetTopFiveUser[]>> => {
  try {
    const authError = await requireRoles(['ADMIN', 'OPERATOR']);
    if (authError) return authError;

    await connectMongoDB();

    const pipeline: mongoose.PipelineStage[] = [
      {
        $group: {
          _id: '$userId',
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
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $unwind: {
          path: '$userDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          name: {
            $concat: [{ $ifNull: ['$userDetails.firstName', 'Bilinmeyen'] }, ' ', { $ifNull: ['$userDetails.lastName', 'Kullanıcı'] }],
          },
          value: '$totalShippings',
        },
      },
    ];

    const stats = (await Shipping.aggregate(pipeline)) as SummaryTypes.IGetTopFiveUser[];

    return {
      status: 'OK',
      data: stats,
    };
  } catch (error) {
    if (error instanceof Error) Sentry.captureException(error);
    return { status: 'ERROR', message: generalMessages.UNEXPECTED_ERROR };
  }
};

export default getTopFiveUser;
