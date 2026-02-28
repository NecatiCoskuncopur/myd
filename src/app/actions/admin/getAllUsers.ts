'use server';

import { messages } from '@/constants';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import { Balance, PricingList, User } from '@/models';

const getAllUsers = async (params: IListAllUsersParams): Promise<IActionResponse<IUsersData>> => {
  try {
    const authError = await requireRoles(['ADMIN']);
    if (authError) return authError;

    await connectMongoDB();

    const { page = 1, limit = 5, balanceSorting, firstName, lastName, company, phone, email } = params;

    const safePage = Math.max(page, 1);
    const safeLimit = Math.max(limit, 1);
    const skip = (safePage - 1) * safeLimit;

    const match: Record<string, unknown> = {
      ...(firstName && {
        firstName: { $regex: firstName, $options: 'i' },
      }),
      ...(lastName && {
        lastName: { $regex: lastName, $options: 'i' },
      }),
      ...(company && {
        company: { $regex: company, $options: 'i' },
      }),
      ...(phone && {
        phone: { $regex: phone, $options: 'i' },
      }),
      ...(email && {
        email: { $regex: email, $options: 'i' },
      }),
    };

    const sort: Record<string, 1 | -1> =
      balanceSorting === '1' || balanceSorting === '-1' ? { 'balance.total': Number(balanceSorting) as 1 | -1 } : { createdAt: 1 };

    const aggregation = await User.aggregate([
      { $match: match },

      {
        $lookup: {
          from: Balance.collection.name,
          localField: '_id',
          foreignField: 'userId',
          as: 'balance',
        },
      },
      {
        $lookup: {
          from: PricingList.collection.name,
          localField: 'priceListId',
          foreignField: '_id',
          as: 'pricingList',
        },
      },
      {
        $addFields: {
          balance: { $arrayElemAt: ['$balance', 0] },
          pricingList: { $arrayElemAt: ['$pricingList', 0] },
        },
      },

      {
        $facet: {
          metadata: [{ $count: 'totalCount' }],
          docs: [{ $sort: sort }, { $skip: skip }, { $limit: safeLimit }],
        },
      },
    ]);

    const totalCount = aggregation[0]?.metadata[0]?.totalCount ?? 0;
    const users = aggregation[0]?.docs ?? [];
    const totalPages = totalCount > 0 ? Math.ceil(totalCount / safeLimit) : 1;

    return {
      status: 'OK',
      data: {
        users,
        totalCount,
        page: safePage,
        limit: safeLimit,
        totalPages,
        hasPrevPage: safePage > 1,
        hasNextPage: safePage < totalPages,
      },
    };
  } catch (error) {
    console.error('Get All Users Error:', error);

    return {
      status: 'ERROR',
      message: messages.GENERAL.UNEXPECTED_ERROR,
    };
  }
};

export default getAllUsers;
