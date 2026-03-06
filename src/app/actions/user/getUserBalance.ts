'use server';

import * as Sentry from '@sentry/nextjs';
import mongoose from 'mongoose';

import { messages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { Balance } from '@/models';

const { GENERAL } = messages;

const getUserBalance = async (params: IPaginationParams): Promise<IActionResponse<IUserBalanceData>> => {
  try {
    await connectMongoDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { status: 'ERROR', message: GENERAL.UNAUTHORIZED };
    }

    const page = Math.max(1, params.page ?? 1);
    const limit = Math.max(1, params.limit ?? 5);
    const skip = (page - 1) * limit;

    const balanceDoc = await Balance.findOne({ userId: new mongoose.Types.ObjectId(currentUser.id) }).lean();

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

    const sortedTransactions = [...balanceDoc.transactions].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const totalCount = sortedTransactions.length;
    const totalPages = totalCount > 0 ? Math.ceil(totalCount / limit) : 1;

    const paginatedTransactions: IUserTransaction[] = sortedTransactions.slice(skip, skip + limit).map(tx => ({
      transactionType: tx.transactionType,
      amount: tx.amount,
      shippingId: tx.shippingId?.toString(),
      note: tx.note,
      createdAt: tx.createdAt,
    }));

    return {
      status: 'OK',
      data: {
        balanceId: balanceDoc._id.toString(),
        userId: balanceDoc.userId.toString(),
        total: balanceDoc.total,
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
      Sentry.captureException(error);
    }

    return { status: 'ERROR', message: GENERAL.UNEXPECTED_ERROR };
  }
};

export default getUserBalance;
