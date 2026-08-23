'use server';

import { escapeRegex, generalMessages, UserRole } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import serialize from '@/lib/serialize';
import { User } from '@/models';
import { AdminTypes } from '@/types/admin';

const { UNEXPECTED_ERROR } = generalMessages;

const searchSenderUser = async (params: AdminTypes.ISearchSenderUserParams) => {
  try {
    const authError = await requireRoles([UserRole.ADMIN, UserRole.OPERATOR]);
    if (authError) return authError;

    const { firstName, lastName, company } = params;

    if (!firstName && !lastName && !company) {
      return { status: 'OK', data: [] };
    }

    await connectMongoDB();

    const createSearchRegex = (value: string) => ({
      $regex: `^${escapeRegex(value.trim())}`,
      $options: 'i',
    });

    const matchArray = [];
    if (firstName) {
      matchArray.push({ firstName: createSearchRegex(firstName) });
    }

    if (lastName) {
      matchArray.push({
        lastName: createSearchRegex(lastName),
      });
    }

    if (company) {
      matchArray.push({
        company: createSearchRegex(company),
      });
    }

    const query = { $or: matchArray };

    const result = await User.find(query).select('_id firstName lastName company').limit(5).lean();

    return {
      status: 'OK',
      data: serialize(result),
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      captureActionError('searchSenderUser', error);
    }
    return { status: 'ERROR', message: UNEXPECTED_ERROR };
  }
};

export default searchSenderUser;
