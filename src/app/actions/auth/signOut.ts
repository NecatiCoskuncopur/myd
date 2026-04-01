'use server';

import { cookies } from 'next/headers';

import * as Sentry from '@sentry/nextjs';

import { authMessages } from '@/constants';

const signOut = async (): Promise<ResponseTypes.IActionResponse> => {
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
      message: authMessages.SIGNOUT.ERROR,
    };
  }
};

export default signOut;
