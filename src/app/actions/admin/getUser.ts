'use server';

import { messages } from '@/constants';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import { User } from '@/models';

const { GENERAL, USER } = messages;

const getUser = async (userId: string): Promise<IActionResponse<IUser>> => {
  try {
    const authError = await requireRoles(['ADMIN', 'OPERATOR']);
    if (authError) return authError;

    await connectMongoDB();

    const userDoc = await User.findById(userId).select('-password').lean();

    if (!userDoc) {
      return { status: 'ERROR', message: USER.NOT_FOUND };
    }

    return {
      status: 'OK',
      data: userDoc as IUser,
    };
  } catch {
    return { status: 'ERROR', message: GENERAL.UNEXPECTED_ERROR };
  }
};

export default getUser;
