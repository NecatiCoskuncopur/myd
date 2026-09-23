'use server';

import { generalMessages, UserRole } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import serialize from '@/lib/serialize';
import { Shipping, Transaction, User } from '@/models';
import { AdminTypes } from '@/types/admin';
import { BalanceTypes } from '@/types/balance';

const { UNEXPECTED_ERROR } = generalMessages;

const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 100;

const getBalanceData = async (params: AdminTypes.IGetBalanceParams): Promise<ResponseTypes.IActionResponse<BalanceTypes.IUserBalanceData>> => {
  try {
    const authError = await requireRoles([UserRole.ADMIN]);
    if (authError) return authError;

    await connectMongoDB();

    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(Math.max(1, Number(params.limit) || DEFAULT_LIMIT), MAX_LIMIT);
    const skip = (page - 1) * limit;

    const targetUserId = params.userId;

    const [userDoc, transactionDocs, totalCount] = await Promise.all([
      User.findById(targetUserId).select('balance').lean(),
      Transaction.find({ userId: targetUserId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'shippingId',
          model: Shipping,
          select: '_id carrier.amount carrier.dutiesAndTaxesCost carrier.insuranceCost carrier.longSideSurchargeCost carrier.serviceFee +carrier.cost',
        })
        .lean(),
      Transaction.countDocuments({ userId: targetUserId }),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalCount / limit));
    const totalBalance = userDoc?.balance ?? 0;
    const serializedTransactions = serialize<BalanceTypes.ISerializedTransaction[]>(transactionDocs);

    return {
      status: 'OK',
      data: {
        userId: targetUserId,
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
      captureActionError('getBalanceData', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default getBalanceData;
