'use server';

import { AuthError, CredentialsSignin } from 'next-auth';

import { authSignIn } from '@/auth';
import { authMessages, generalMessages } from '@/constants';
import captureActionError from '@/lib/captureActionError';

const { INVALID_CREDENTIALS } = authMessages;
const { UNEXPECTED_ERROR } = generalMessages;

const signIn = async (data: AuthTypes.ISignInPayload): Promise<ResponseTypes.IActionResponse> => {
  try {
    await authSignIn('credentials', {
      email: data.email,
      password: data.password,
      recaptchaToken: data.recaptchaToken,
      redirect: false,
    });

    return {
      status: 'OK',
    };
  } catch (error) {
    if (error instanceof CredentialsSignin) {
      return {
        status: 'ERROR',
        message: INVALID_CREDENTIALS,
      };
    }

    if (error instanceof AuthError) {
      return {
        status: 'ERROR',
        message: UNEXPECTED_ERROR,
      };
    }

    if (error instanceof Error) {
      captureActionError('signIn', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default signIn;
