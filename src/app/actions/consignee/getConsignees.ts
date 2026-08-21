'use server';

import * as Sentry from '@sentry/nextjs';

import { generalMessages, UserRole } from '@/constants';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { Consignee } from '@/models';
import { ConsigneeTypes } from '@/types/consignee';

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getConsignees = async (params: ConsigneeTypes.IConsigneeParams): Promise<ResponseTypes.IActionResponse<ConsigneeTypes.IConsigneeData>> => {
  try {
    await connectMongoDB();

    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return {
        status: 'ERROR',
        message: generalMessages.UNAUTHORIZED,
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
        consignees: JSON.parse(JSON.stringify(results)),
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
      Sentry.withScope(scope => {
        scope.setTag('action', 'getConsignees');
        scope.captureException(error);
      });
    }

    return {
      status: 'ERROR',
      message: generalMessages.UNEXPECTED_ERROR,
    };
  }
};

export default getConsignees;
