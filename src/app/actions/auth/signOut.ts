'use server';

import { AuthError } from 'next-auth';

import { authSignOut } from '@/auth';
import { authMessages } from '@/constants';
import captureActionError from '@/lib/captureActionError';

const { SIGNOUT } = authMessages;

const signOut = async (): Promise<ResponseTypes.IActionResponse> => {
  try {
    await authSignOut({
      redirect: false,
    });

    return {
      status: 'OK',
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        status: 'ERROR',
        message: SIGNOUT.ERROR,
      };
    }

    if (error instanceof Error) {
      captureActionError('signOut', error);
    }

    return {
      status: 'ERROR',
      message: SIGNOUT.ERROR,
    };
  }
};

export default signOut;
