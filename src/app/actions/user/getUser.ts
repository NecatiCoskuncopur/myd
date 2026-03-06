'use server';

import * as Sentry from '@sentry/nextjs';

import { messages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { User } from '@/models';
const { GENERAL, USER } = messages;

const getUser = async (): Promise<IActionResponse<IUser>> => {
  try {
    await connectMongoDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { status: 'ERROR', message: GENERAL.UNAUTHORIZED };
    }

    const userDoc = await User.findById(currentUser.id).select('-password').lean();

    if (!userDoc) {
      return { status: 'ERROR', message: USER.NOT_FOUND };
    }

    return {
      status: 'OK',
      data: userDoc as IUser,
    };
  } catch (error) {
    if (error instanceof Error) {
      Sentry.captureException(error);
    }

    return { status: 'ERROR', message: GENERAL.UNEXPECTED_ERROR };
  }
};

export default getUser;
