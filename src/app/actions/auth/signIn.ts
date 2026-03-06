'use server';
import { cookies } from 'next/headers';

import * as Sentry from '@sentry/nextjs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ValidationError } from 'yup';

import { messages } from '@/constants';
import connectMongoDB from '@/lib/db';
import env from '@/lib/env';
import validateRecaptcha from '@/lib/validateRecaptcha';
import { User } from '@/models';
import loginSchema from '@/schemas/login.schema';

const { AUTH, GENERAL } = messages;

const signIn = async (data: ISignInPayload): Promise<IActionResponse<ISignInResponse>> => {
  try {
    await connectMongoDB();

    const validatedData = await loginSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    await validateRecaptcha(validatedData.recaptchaToken);

    const user = await User.findOne({ email: validatedData.email });

    const hashedPassword = user?.password ?? '$2a$12$invalidsaltinvalidsaltinv';

    const isCorrectPassword = await bcrypt.compare(validatedData.password, hashedPassword);

    if (!user || !isCorrectPassword) {
      return {
        status: 'ERROR',
        message: AUTH.INVALID_CREDENTIALS,
      };
    }

    const payload = {
      userId: user._id.toString(),
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
      message: GENERAL.UNEXPECTED_ERROR,
    };
  }
};

export default signIn;
