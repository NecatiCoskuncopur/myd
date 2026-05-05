'use server';

import * as Sentry from '@sentry/nextjs';
import mongoose from 'mongoose';

import { generalMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { Balance } from '@/models';

const { UNAUTHORIZED, UNEXPECTED_ERROR } = generalMessages;

const getUserBalance = async (params: ParamsTypes.IPaginationParams): Promise<ResponseTypes.IActionResponse<BalanceTypes.IUserBalanceData>> => {
  try {
    await connectMongoDB();

    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
      return { status: 'ERROR', message: UNAUTHORIZED };
    }

    const { page = 1, limit = 5 } = params;
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

    const allTransactions = balanceDoc.transactions || [];
    const sortedTransactions = [...allTransactions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const totalCount = sortedTransactions.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));

    const paginatedTransactions: BalanceTypes.IUserTransaction[] = sortedTransactions.slice(skip, skip + limit).map(tx => ({
      transactionType: tx.transactionType,
      amount: tx.amount || 0,
      shippingId: tx.shippingId ? String(tx.shippingId) : undefined,
      note: tx.note || '',
      createdAt: new Date(tx.createdAt),
    }));

    return {
      status: 'OK',
      data: {
        balanceId: String(balanceDoc._id),
        userId: String(balanceDoc.userId),
        total: balanceDoc.total || 0,
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
    return { status: 'ERROR', message: UNEXPECTED_ERROR };
  }
};

export default getUserBalance;
