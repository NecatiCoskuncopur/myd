'use server';

import * as Sentry from '@sentry/nextjs';
import bcrypt from 'bcryptjs';
import { ValidationError } from 'yup';

import { messages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { User } from '@/models';
import changePasswordSchema from '@/schemas/changePassword.schema';

const { GENERAL, PASSWORD } = messages;

const changePassword = async (data: IChangePasswordPayload): Promise<IActionResponse> => {
  try {
    await connectMongoDB();

    const validatedData = await changePasswordSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        status: 'ERROR',
        message: GENERAL.UNAUTHORIZED,
      };
    }

    const user = await User.findById(currentUser.id);
    if (!user) {
      return {
        status: 'ERROR',
        message: GENERAL.UNAUTHORIZED,
      };
    }

    if (validatedData.currentPassword === validatedData.newPassword) {
      return {
        status: 'ERROR',
        message: PASSWORD.SAME_AS_OLD,
      };
    }

    const isCorrect = await bcrypt.compare(validatedData.currentPassword, user.password);

    if (!isCorrect) {
      return {
        status: 'ERROR',
        message: PASSWORD.CURRENT_INVALID,
      };
    }

    user.password = await bcrypt.hash(validatedData.newPassword, 12);
    await user.save();

    return {
      status: 'OK',
      message: PASSWORD.SUCCESS,
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

export default changePassword;
