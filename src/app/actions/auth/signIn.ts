'use server';
import { cookies } from 'next/headers';

import * as Sentry from '@sentry/nextjs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ValidationError } from 'yup';

import { authMessages, generalMessages, userMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import env from '@/lib/env';
import validateRecaptcha from '@/lib/validateRecaptcha';
import { User } from '@/models';
import loginSchema from '@/schemas/login.schema';

const signIn = async (data: AuthTypes.ISignInPayload): Promise<ResponseTypes.IActionResponse<AuthTypes.ISignInResponse>> => {
  try {
    await connectMongoDB();

    const validatedData = await loginSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    const captchaResult = await validateRecaptcha(validatedData.recaptchaToken);
    if (!captchaResult.success) {
      return { status: 'ERROR', message: captchaResult.message };
    }

    const user = await User.findOne({ email: validatedData.email.toLowerCase() }).select('+password');

    const hashedPassword = user?.password ?? '$2a$12$invalidsaltinvalidsaltinv';

    const isCorrectPassword = await bcrypt.compare(validatedData.password, hashedPassword);

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

    const payload = {
      sub: user._id.toString(),
      role: user.role,
    };

    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: '1d',
    });

    const cookieStore = await cookies();

    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return {
      status: 'OK',
      data: {
        role: user.role,
        barcodePermits: user.barcodePermits,
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
      Sentry.captureException(error);
    }

    return {
      status: 'ERROR',
      message: generalMessages.UNEXPECTED_ERROR,
    };
  }
};

export default signIn;
