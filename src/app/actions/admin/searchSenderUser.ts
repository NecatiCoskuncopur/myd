'use server';

import { messages } from '@/constants';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import { User } from '@/models';

const searchSenderUser = async (nameSearch: string): Promise<IActionResponse<IUser[]>> => {
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
      firstName: { $regex: `^${escapedSearch}`, $options: 'i' },
    })
      .select('_id firstName lastName company')
      .limit(5)
      .lean<IUser[]>();

    return {
      status: 'OK',
      data: result,
    };
  } catch (error) {
    console.error('Search Sender User Error:', error);

    return {
      status: 'ERROR',
      message: messages.GENERAL.UNEXPECTED_ERROR,
    };
  }
};

export default searchSenderUser;
