'use server';

import * as Sentry from '@sentry/nextjs';
import { ValidationError } from 'yup';

import { generalMessages, userMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import { User } from '@/models';
import setUserSchema from '@/schemas/setUser.schema';

const { NOT_FOUND, EDITUSER, EMAIL } = userMessages;
const { UNEXPECTED_ERROR } = generalMessages;

const setUser = async (data: AdminTypes.ISetUserPayload): Promise<ResponseTypes.IActionResponse> => {
  try {
    const authError = await requireRoles(['ADMIN']);
    if (authError) return authError;

    await connectMongoDB();

    const validatedData = await setUserSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    const { userId, ...updateData } = validatedData;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedUser) {
      return {
        status: 'ERROR',
        message: NOT_FOUND,
      };
    }

    return { status: 'OK', message: EDITUSER.SUCCESS };
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const mongoError = error as { code: number };
      if (mongoError.code === 11000) {
        return {
          status: 'ERROR',
          message: EMAIL.EXIST,
        };
      }
    }

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
      message: UNEXPECTED_ERROR,
    };
  }
};

export default setUser;
