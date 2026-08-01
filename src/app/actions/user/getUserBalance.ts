'use server';

import * as Sentry from '@sentry/nextjs';
import mongoose from 'mongoose';

import { generalMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { Balance } from '@/models';
import { BalanceTypes } from '@/types/balance';

const { UNAUTHORIZED, UNEXPECTED_ERROR } = generalMessages;

const getUserBalance = async (params: ParamsTypes.IPaginationParams): Promise<ResponseTypes.IActionResponse<BalanceTypes.IUserBalanceData>> => {
  try {
    await connectMongoDB();

    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return { status: 'ERROR', message: UNAUTHORIZED };
    }

    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 5);

    const skip = (page - 1) * limit;

    const balanceDoc = await Balance.findOne({
      userId: new mongoose.Types.ObjectId(currentUser.id),
    }).lean();

    if (!balanceDoc) {
      return {
        status: 'OK',
        data: {
          balanceId: '',
          userId: currentUser.id,
          total: 0,
          transactions: [],
          totalCount: 0,
          page,
          limit,
          totalPages: 1,
          hasPrevPage: false,
          hasNextPage: false,
        },
      };
    }

    const plain = JSON.parse(JSON.stringify(balanceDoc));

    const sortedTransactions = [...(plain.transactions ?? [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const totalCount = sortedTransactions.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));

    const paginatedTransactions = sortedTransactions.slice(skip, skip + limit);

    return {
      status: 'OK',
      data: {
        balanceId: plain._id.toString(),
        userId: plain.userId.toString(),
        total: plain.total ?? 0,
        transactions: paginatedTransactions,
        totalCount,
        page,
        limit,
        totalPages,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      Sentry.withScope(scope => {
        scope.setTag('action', 'getUserBalance');
        scope.captureException(error);
      });
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default getUserBalance;
