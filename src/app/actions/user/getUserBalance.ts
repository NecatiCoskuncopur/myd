'use server';

import mongoose from 'mongoose';

import { getCurrentUser } from '@/lib/getCurrentUser';
import { Balance } from '@/models';

const getUserBalance = async ({ page = 1, limit = 10 }: IUserBalanceParams) => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error('Yetkisiz İşlem');
  }

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

  return {
    docs: result?.docs ?? [],
    totalCount: result?.totalCount ?? 0,
    page,
    limit,
  };
};

export default getUserBalance;
