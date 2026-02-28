'use server';

import { messages } from '@/constants';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import { User } from '@/models';

const getUser = async (userId: string): Promise<IActionResponse<IUser>> => {
  try {
    const authError = await requireRoles(['ADMIN', 'OPERATOR']);
    if (authError) return authError;

    await connectMongoDB();

    const user = await User.findById(userId).lean<IUser>();

    if (!user) {
      return {
        status: 'ERROR',
        message: messages.GENERAL.USER_NOT_FOUND,
      };
    }

    return {
      status: 'OK',
      data: user,
    };
  } catch (error) {
    console.error('Get User Error:', error);

    return {
      status: 'ERROR',
      message: messages.GENERAL.UNEXPECTED_ERROR,
    };
  }
};

export default getUser;
