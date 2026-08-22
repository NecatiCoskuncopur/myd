'use server';

import { cookies } from 'next/headers';

import { AUTH_COOKIE_NAME, authMessages } from '@/constants';
import captureActionError from '@/lib/captureActionError';

const signOut = async (): Promise<ResponseTypes.IActionResponse> => {
  try {
    const cookieStore = await cookies();

    cookieStore.delete({
      name: AUTH_COOKIE_NAME,
      path: '/',
    });

    return {
      status: 'OK',
    };
  } catch (error) {
    if (error instanceof Error) {
      captureActionError('signOut', error);
    }

    return {
      status: 'ERROR',
      message: authMessages.SIGNOUT.ERROR,
    };
  }
};

export default signOut;
