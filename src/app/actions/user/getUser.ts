'use server';

import { generalMessages, userMessages } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import serialize from '@/lib/serialize';
import { User } from '@/models';
import { UserTypes } from '@/types/user';

const { UNAUTHORIZED, UNEXPECTED_ERROR } = generalMessages;
const { NOT_FOUND } = userMessages;

const getUser = async (): Promise<ResponseTypes.IActionResponse<UserTypes.UserDto>> => {
  try {
    await connectMongoDB();

    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return {
        status: 'ERROR',
        message: UNAUTHORIZED,
      };
    }

    const user = await User.findById(currentUser.id).select('-password').lean();

    if (!user) {
      return {
        status: 'ERROR',
        message: NOT_FOUND,
      };
    }

    return {
      status: 'OK',
      data: serialize<UserTypes.UserDto>(user),
    };
  } catch (error) {
    if (error instanceof Error) {
      captureActionError('getUser', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default getUser;
