'use server';

import { generalMessages } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import serialize from '@/lib/serialize';
import { Shipping, Transaction, User } from '@/models';
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

    const [userDoc, transactionDocs, totalCount] = await Promise.all([
      User.findById(currentUser.id).select('balance').lean(),
      Transaction.find({ userId: currentUser.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'shippingId',
          model: Shipping,
          select: '_id carrier.amount carrier.dutiesAndTaxesCost carrier.insuranceCost carrier.longSideSurchargeCost carrier.serviceFee',
        })
        .lean(),
      Transaction.countDocuments({ userId: currentUser.id }),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalCount / limit));
    const totalBalance = userDoc?.balance ?? 0;

    const serializedTransactions = serialize<BalanceTypes.ISerializedTransaction[]>(transactionDocs);

    return {
      status: 'OK',
      data: {
        userId: currentUser.id,
        total: totalBalance,
        transactions: serializedTransactions,
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
