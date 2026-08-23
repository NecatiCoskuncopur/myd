'use server';

import { escapeRegex, generalMessages, UserRole } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import { Balance, User } from '@/models';
import { AdminTypes } from '@/types/admin';
const { UNEXPECTED_ERROR } = generalMessages;

const getAllUsers = async (params: AdminTypes.IListAllUsersParams): Promise<ResponseTypes.IActionResponse<AdminTypes.IUsersData>> => {
  try {
    const authError = await requireRoles([UserRole.ADMIN]);
    if (authError) return authError;

    await connectMongoDB();

    const { page = 1, limit = 5, firstName, lastName, company, phone, email, balanceSorting } = params;

    const safePage = Math.max(Number(page), 1);
    const safeLimit = Math.max(Number(limit), 1);
    const skip = (safePage - 1) * safeLimit;

    const createSearchRegex = (value: string) => ({
      $regex: `^${escapeRegex(value.trim())}`,
      $options: 'i',
    });

    const match: Record<string, unknown> = {};
    if (firstName) match.firstName = createSearchRegex(firstName);
    if (lastName) match.lastName = createSearchRegex(lastName);
    if (company) match.company = createSearchRegex(company);
    if (phone) match.phone = createSearchRegex(phone);
    if (email) match.email = createSearchRegex(email);

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

      {
        $addFields: {
          balance: { $arrayElemAt: ['$balance', 0] },
        },
      },

      {
        $project: {
          _id: { $toString: '$_id' },
          email: 1,
          firstName: 1,
          lastName: 1,
          nickname: 1,
          company: 1,
          taxId: 1,
          taxOffice: 1,
          phone: 1,
          address: 1,
          role: 1,
          isActive: 1,
          barcodePermits: 1,

          priceLists: {
            $map: {
              input: '$priceLists',
              as: 'priceList',
              in: {
                serviceType: '$$priceList.serviceType',
                priceListId: {
                  $toString: '$$priceList.priceListId',
                },
              },
            },
          },

          createdAt: {
            $dateToString: {
              format: '%Y-%m-%dT%H:%M:%S.%LZ',
              date: '$createdAt',
            },
          },

          balance: {
            _id: { $toString: '$balance._id' },
            total: { $ifNull: ['$balance.total', 0] },
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
      captureActionError('getAllUsers', error);
    }
    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default getAllUsers;
