'use server';

import bcrypt from 'bcryptjs';
import { ValidationError } from 'yup';

import { BCRYPT_SALT_ROUNDS, generalMessages, userMessages } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { User } from '@/models';
import changePasswordSchema from '@/schemas/changePassword.schema';
import { UserTypes } from '@/types/user';

const { PASSWORD } = userMessages;
const { UNAUTHORIZED, UNEXPECTED_ERROR } = generalMessages;

const changePassword = async (data: UserTypes.IChangePasswordPayload): Promise<ResponseTypes.IActionResponse> => {
  try {
    const validatedData = await changePasswordSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });
    await connectMongoDB();

    const currentUser = await getCurrentUser();
    if (!currentUser?.id) {
      return {
        status: 'ERROR',
        message: UNAUTHORIZED,
      };
    }

    const user = await User.findById(currentUser.id).select('+password');
    if (!user) {
      return {
        status: 'ERROR',
        message: UNAUTHORIZED,
      };
    }

    const isCurrentPasswordValid = await bcrypt.compare(validatedData.currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      return {
        status: 'ERROR',
        message: PASSWORD.CURRENT_INVALID,
      };
    }

    if (validatedData.currentPassword === validatedData.newPassword) {
      return {
        status: 'ERROR',
        message: PASSWORD.SAME_AS_OLD,
      };
    }

    user.password = await bcrypt.hash(validatedData.newPassword, BCRYPT_SALT_ROUNDS);
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
      captureActionError('changePassword', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default changePassword;
