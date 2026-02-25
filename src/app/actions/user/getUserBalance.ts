'use server';

import mongoose from 'mongoose';

import { messages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { Balance } from '@/models';

const getUserBalance = async (params: IPaginationParams): Promise<IActionResponse<IUserBalanceData>> => {
  try {
    await connectMongoDB();
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        status: 'ERROR',
        message: messages.GENERAL.UNAUTHORIZED,
      };
    }
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.max(1, params.limit ?? 5);

    const skip = (page - 1) * limit;

    const [result] = await Balance.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(currentUser.id),
        },
      },
      { $unwind: '$transactions' },
      { $sort: { 'transactions.createdAt': -1 } },
      {
        $facet: {
          docs: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: 'count' }],
        },
      },
      {
        $project: {
          docs: 1,
          totalCount: {
            $ifNull: [{ $arrayElemAt: ['$totalCount.count', 0] }, 0],
          },
        },
      },
    ]);

    const totalCount = result?.totalCount ?? 0;

    const totalPages = totalCount > 0 ? Math.ceil(totalCount / limit) : 1;

    return {
      status: 'OK',
      data: {
        balances: result?.doc ?? [],
        totalCount,
        page,
        limit,
        totalPages,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
      },
    };
  } catch (error) {
    console.error('Get User Balance Error:', error);

    return {
      status: 'ERROR',
      message: messages.GENERAL.UNEXPECTED_ERROR,
    };
  }
};

export default getUserBalance;
