'use server';

import { messages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { Consignee } from '@/models';

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getConsignee = async (params: IConsigneeParams): Promise<IActionResponse<IConsigneeData>> => {
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
    const safeName = escapeRegex(params.name.trim());

    const filter = {
      userId: currentUser.id,
      name: { $regex: `^${safeName}`, $options: 'i' },
    };

    const [results, totalCount] = await Promise.all([Consignee.find(filter).skip(skip).limit(limit).lean(), Consignee.countDocuments(filter)]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      status: 'OK',
      data: {
        consignees: results,
        totalCount,
        page,
        limit,
        totalPages,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
      },
    };
  } catch (error) {
    console.error(error);

    return {
      status: 'ERROR',
      message: error instanceof Error ? error.message : messages.GENERAL.UNEXPECTED_ERROR,
    };
  }
};

export default getConsignee;
