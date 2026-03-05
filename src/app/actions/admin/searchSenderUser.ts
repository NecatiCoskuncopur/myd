'use server';

import { messages } from '@/constants';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import { User } from '@/models';

const { GENERAL } = messages;

const searchSenderUser = async (nameSearch: string): Promise<IActionResponse<ISearchSenderResult[]>> => {
  try {
    const authError = await requireRoles(['OPERATOR', 'ADMIN']);
    if (authError) return authError;

    const search = nameSearch?.trim();

    if (!search || search.length < 2) {
      return {
        status: 'OK',
        data: [],
      };
    }

    await connectMongoDB();

    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const result = await User.find({
      $or: [
        { firstName: { $regex: `^${escapedSearch}`, $options: 'i' } },
        { lastName: { $regex: `^${escapedSearch}`, $options: 'i' } },
        { company: { $regex: `^${escapedSearch}`, $options: 'i' } },
      ],
    })
      .select('_id firstName lastName company')
      .limit(5)
      .lean<ISearchSenderResult[]>();

    return {
      status: 'OK',
      data: result,
    };
  } catch {
    return {
      status: 'ERROR',
      message: GENERAL.UNEXPECTED_ERROR,
    };
  }
};

export default searchSenderUser;
