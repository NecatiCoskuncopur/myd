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

    const balance = await Balance.findOne({
      userId: new mongoose.Types.ObjectId(currentUser.id),
    }).lean<{
      _id: mongoose.Types.ObjectId;
      userId: mongoose.Types.ObjectId;
      total?: number;
      transactions: {
        transactionType: 'PAY' | 'SPEND';
        amount?: number;
        shippingId?: mongoose.Types.ObjectId;
        note?: string;
        createdAt: Date;
      }[];
    }>();

    if (!balance) {
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

    const sortedTransactions = [...balance.transactions].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const totalCount = sortedTransactions.length;
    const totalPages = totalCount > 0 ? Math.ceil(totalCount / limit) : 1;

    const paginatedTransactions = sortedTransactions.slice(skip, skip + limit).map<IUserTransaction>(tx => ({
      transactionType: tx.transactionType,
      amount: tx.amount,
      shippingId: tx.shippingId?.toString(),
      note: tx.note,
      createdAt: tx.createdAt,
    }));

    return {
      status: 'OK',
      data: {
        balanceId: balance._id.toString(),
        userId: balance.userId.toString(),
        total: balance.total,
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
    console.error('Get User Balance Error:', error);

    return {
      status: 'ERROR',
      message: messages.GENERAL.UNEXPECTED_ERROR,
    };
  }
};

export default getUserBalance;
