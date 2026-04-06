'use server';

import * as Sentry from '@sentry/nextjs';

import { generalMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import { Balance, PricingList, User } from '@/models';

const { UNEXPECTED_ERROR } = generalMessages;

const getAllUsers = async (params: AdminTypes.IListAllUsersParams): Promise<ResponseTypes.IActionResponse<AdminTypes.IUsersData>> => {
  try {
    const authError = await requireRoles(['ADMIN']);
    if (authError) return authError;

    await connectMongoDB();

    const { page = 1, limit = 5, firstName, lastName, company, phone, email, balanceSorting } = params;

    const safePage = Math.max(Number(page), 1);
    const safeLimit = Math.max(Number(limit), 1);
    const skip = (safePage - 1) * safeLimit;

    const match: Record<string, unknown> = {};
    if (firstName) match.firstName = { $regex: `^${firstName}`, $options: 'i' };
    if (lastName) match.lastName = { $regex: `^${lastName}`, $options: 'i' };
    if (company) match.company = { $regex: `^${company}`, $options: 'i' };
    if (phone) match.phone = { $regex: `^${phone}`, $options: 'i' };
    if (email) match.email = { $regex: `^${email}`, $options: 'i' };

    const sort: Record<string, 1 | -1> =
      balanceSorting === '1' || balanceSorting === '-1' ? { 'balance.total': Number(balanceSorting) as 1 | -1 } : { createdAt: -1 };

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

      // PricingList ile ilişki kur
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
        $project: {
          _id: { $toString: '$_id' },
          email: 1,
          firstName: 1,
          lastName: 1,
          company: 1,
          phone: 1,
          address: 1,
          role: 1,
          isActive: 1,
          createdAt: { $dateToString: { format: '%Y-%m-%dT%H:%M:%S.%LZ', date: '$createdAt' } },
          balance: {
            _id: { $toString: '$balance._id' },
            total: { $ifNull: ['$balance.total', 0] },
          },
          pricingList: {
            _id: { $toString: '$pricingList._id' },
            name: { $ifNull: ['$pricingList.name', 'Tanımlanmamış'] },
          },
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
    const totalPages = Math.ceil(totalCount / safeLimit) || 1;

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
    if (error instanceof Error) {
      Sentry.captureException(error);
    }
    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default getAllUsers;
