'use server';

import * as Sentry from '@sentry/nextjs';

import { generalMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import { User } from '@/models';
import { AdminTypes } from '@/types/admin';

const { UNEXPECTED_ERROR } = generalMessages;

const searchSenderUser = async (params: AdminTypes.ISearchSenderUserParams) => {
  try {
    const authError = await requireRoles(['OPERATOR', 'ADMIN']);
    if (authError) return authError;

    const { firstName, lastName, company } = params;

    if (!firstName && !lastName && !company) {
      return { status: 'OK', data: [] };
    }

    await connectMongoDB();

    const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const matchArray = [];
    if (firstName) matchArray.push({ firstName: { $regex: `^${escape(firstName)}`, $options: 'i' } });
    if (lastName) matchArray.push({ lastName: { $regex: `^${escape(lastName)}`, $options: 'i' } });
    if (company) matchArray.push({ company: { $regex: `^${escape(company)}`, $options: 'i' } });

    const query = { $or: matchArray };

    const result = await User.find(query).select('_id firstName lastName company').limit(5).lean();

    return {
      status: 'OK',
      data: result,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      Sentry.captureException(error);
    }
    return { status: 'ERROR', message: UNEXPECTED_ERROR };
  }
};

export default searchSenderUser;
