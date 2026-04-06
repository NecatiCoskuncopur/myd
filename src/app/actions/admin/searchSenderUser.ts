'use server';

import * as Sentry from '@sentry/nextjs';

import { generalMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import { User } from '@/models';

const { UNEXPECTED_ERROR } = generalMessages;

const searchSenderUser = async (params: AdminTypes.ISearchSenderUserParams): Promise<ResponseTypes.IActionResponse<AdminTypes.ISearchSenderResult[]>> => {
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

    const formattedResult: AdminTypes.ISearchSenderResult[] = result.map((user: AdminTypes.ISearchSenderResult) => ({
      _id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      company: user.company,
    }));

    return {
      status: 'OK',
      data: formattedResult,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      Sentry.captureException(error);
    }
    return { status: 'ERROR', message: UNEXPECTED_ERROR };
  }
};

export default searchSenderUser;
