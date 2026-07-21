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
import { UserTypes } from '@/types/user';

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

    const user = (await User.findOne({
      email: validatedData.email.toLowerCase(),
    }).select('+password')) as UserTypes.IUser | null;

    const hashedPassword = user?.password ?? '$2y$12$L7W.IasE0A6hA9hYm8dMhuXGqVz5.Vq5vY6L7W.IasE0A6hA9hYm8dMhu';
    const isCorrectPassword = await bcrypt.compare(validatedData.password, hashedPassword);

    if (!user || !isCorrectPassword) {
      return {
        status: 'ERROR',
        message: authMessages.INVALID_CREDENTIALS,
      };
    }

    if (!user.isActive) {
      return { status: 'ERROR', message: userMessages.DEACTIVATED };
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
      sameSite: 'strict',
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
      return { status: 'ERROR', message: error.errors.join(', ') };
    }

    Sentry.withScope(scope => {
      scope.setExtra('payload_email', data.email);
      Sentry.captureException(error);
    });

    return {
      status: 'ERROR',
      message: generalMessages.UNEXPECTED_ERROR,
    };
  }
};

export default signIn;
