'use server';

import { Types } from 'mongoose';

import { generalMessages, UserRole } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import serialize from '@/lib/serialize';
import { Balance } from '@/models';
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

    const result = await Balance.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(params.userId),
        },
      },
      {
        $project: {
          _id: 0,

          balanceId: {
            $toString: '$_id',
          },

          userId: {
            $toString: '$userId',
          },

          total: {
            $ifNull: ['$total', 0],
          },

          totalCount: {
            $size: {
              $ifNull: ['$transactions', []],
            },
          },

          transactions: {
            $slice: [
              {
                $sortArray: {
                  input: {
                    $ifNull: ['$transactions', []],
                  },
                  sortBy: {
                    createdAt: -1,
                  },
                },
              },
              skip,
              limit,
            ],
          },
        },
      },
    ]);

    const balance = result[0];

    if (!balance) {
      return {
        status: 'OK',
        data: {
          balanceId: '',
          userId: params.userId,
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

    const totalPages = Math.max(1, Math.ceil(balance.totalCount / limit));

    const serializedBalance = serialize<{
      balanceId: string;
      userId: string;
      total: number;
      totalCount: number;
      transactions: BalanceTypes.ISerializedTransaction[];
    }>(balance);

    return {
      status: 'OK',
      data: {
        balanceId: serializedBalance.balanceId,
        userId: serializedBalance.userId,
        total: serializedBalance.total,
        transactions: serializedBalance.transactions,
        totalCount: serializedBalance.totalCount,
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
