'use server';

import * as Sentry from '@sentry/nextjs';

import { generalMessages, userMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { User } from '@/models';
import { UserTypes } from '@/types/user';

const getUser = async (): Promise<ResponseTypes.IActionResponse<UserTypes.UserDto>> => {
  try {
    await connectMongoDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { status: 'ERROR', message: generalMessages.UNAUTHORIZED };
    }

    const userDoc = await User.findById(currentUser.id).select('-password').lean();

    if (!userDoc) {
      return { status: 'ERROR', message: userMessages.NOT_FOUND };
    }

    return {
      status: 'OK',
      data: JSON.parse(JSON.stringify(userDoc)),
    };
  } catch (error) {
    if (error instanceof Error) {
      Sentry.captureException(error);
    }

    return { status: 'ERROR', message: generalMessages.UNEXPECTED_ERROR };
  }
};

export default getUser;
