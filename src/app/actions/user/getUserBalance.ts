'use server';

import { generalMessages } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import serialize from '@/lib/serialize';
import { Balance } from '@/models';
import { BalanceTypes } from '@/types/balance';

const { UNAUTHORIZED, UNEXPECTED_ERROR } = generalMessages;

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 100;

const getUserBalance = async (params: ParamsTypes.IPaginationParams): Promise<ResponseTypes.IActionResponse<BalanceTypes.IUserBalanceData>> => {
  try {
    await connectMongoDB();

    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return {
        status: 'ERROR',
        message: UNAUTHORIZED,
      };
    }

    const page = Math.max(1, Number(params.page) || 1);

    const limit = Math.min(Math.max(1, Number(params.limit) || DEFAULT_LIMIT), MAX_LIMIT);

    const skip = (page - 1) * limit;

    const balanceDoc = await Balance.findOne({
      userId: currentUser.id,
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

    const balance = serialize<BalanceTypes.ISerializedBalance>(balanceDoc);
    const sortedTransactions = [...balance.transactions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const totalCount = sortedTransactions.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));
    const paginatedTransactions = sortedTransactions.slice(skip, skip + limit);

    return {
      status: 'OK',
      data: {
        balanceId: balance._id,
        userId: balance.userId,
        total: balance.total ?? 0,
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
      captureActionError('getUserBalance', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default getUserBalance;
