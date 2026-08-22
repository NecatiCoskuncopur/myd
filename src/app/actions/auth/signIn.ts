'use server';

import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ValidationError } from 'yup';

import { AUTH_COOKIE_NAME, AUTH_TOKEN_TTL_SECONDS, authMessages, DUMMY_PASSWORD_HASH, generalMessages, userMessages } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import env from '@/lib/env';
import validateRecaptcha from '@/lib/validateRecaptcha';
import { User } from '@/models';
import loginSchema from '@/schemas/login.schema';

const signIn = async (data: AuthTypes.ISignInPayload): Promise<ResponseTypes.IActionResponse<AuthTypes.ISignInResponse>> => {
  try {
    const validatedData = await loginSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    const captchaResult = await validateRecaptcha(validatedData.recaptchaToken);

    if (!captchaResult.success) {
      return {
        status: 'ERROR',
        message: captchaResult.message,
      };
    }

    await connectMongoDB();

    const email = validatedData.email.trim().toLowerCase();
    const user = await User.findOne({ email }).select('_id role isActive barcodePermits +password');
    const passwordHash = user?.password ?? DUMMY_PASSWORD_HASH;
    const isCorrectPassword = await bcrypt.compare(validatedData.password, passwordHash);

    if (!user || !isCorrectPassword) {
      return {
        status: 'ERROR',
        message: authMessages.INVALID_CREDENTIALS,
      };
    }

    if (!user.isActive) {
      return {
        status: 'ERROR',
        message: userMessages.DEACTIVATED,
      };
    }

    const token = jwt.sign(
      {
        sub: user._id.toString(),
        role: user.role,
      },
      env.JWT_SECRET,
      {
        algorithm: 'HS256',
        expiresIn: AUTH_TOKEN_TTL_SECONDS,
      },
    );

    const cookieStore = await cookies();

    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: AUTH_TOKEN_TTL_SECONDS,
    });

    return {
      status: 'OK',
      data: {
        role: user.role,
        barcodePermits: user.barcodePermits?.map(id => id.toString()) ?? [],
      },
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        status: 'ERROR',
        message: error.errors.join(', '),
      };
    }

    if (error instanceof Error) {
      captureActionError('signIn', error);
    }

    return {
      status: 'ERROR',
      message: generalMessages.UNEXPECTED_ERROR,
    };
  }
};

export default signIn;
