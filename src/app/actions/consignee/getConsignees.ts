'use server';

import { escapeRegex, generalMessages, UserRole } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import serialize from '@/lib/serialize';
import { Consignee } from '@/models';
import { ConsigneeTypes } from '@/types/consignee';

const { UNAUTHORIZED, UNEXPECTED_ERROR } = generalMessages;

const getConsignees = async (params: ConsigneeTypes.IConsigneeParams): Promise<ResponseTypes.IActionResponse<ConsigneeTypes.IConsigneeData>> => {
  try {
    await connectMongoDB();

    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return {
        status: 'ERROR',
        message: UNAUTHORIZED,
      };
    }

    const page = Math.max(1, params.page ?? 1);
    const limit = Math.max(1, params.limit ?? 5);

    const name = params.name?.trim() ?? '';

    if (!name) {
      return {
        status: 'OK',
        data: {
          consignees: [],
          totalCount: 0,
          page,
          limit,
          totalPages: 0,
          hasPrevPage: false,
          hasNextPage: false,
        },
      };
    }

    const skip = (page - 1) * limit;
    const safeName = escapeRegex(name.trim());

    const filter =
      currentUser.role === UserRole.ADMIN
        ? {
            name: {
              $regex: `^${safeName}`,
              $options: 'i',
            },
          }
        : {
            userId: currentUser.id,
            name: {
              $regex: `^${safeName}`,
              $options: 'i',
            },
          };

    const [results, totalCount] = await Promise.all([Consignee.find(filter).skip(skip).limit(limit).lean(), Consignee.countDocuments(filter)]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      status: 'OK',
      data: {
        consignees: serialize<ConsigneeTypes.IConsigneeResponse[]>(results),
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
      captureActionError('getConsignees', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default getConsignees;
