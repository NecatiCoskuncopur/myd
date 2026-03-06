'use server';

import { cookies } from 'next/headers';

import * as Sentry from '@sentry/nextjs';

import { messages } from '@/constants';

const signOut = async (): Promise<IActionResponse> => {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('token');

    return { status: 'OK' };
  } catch (error) {
    if (error instanceof Error) {
      Sentry.captureException(error);
    }

    return {
      status: 'ERROR',
      message: messages.AUTH.SIGNOUT_ERROR,
    };
  }
};

export default signOut;
