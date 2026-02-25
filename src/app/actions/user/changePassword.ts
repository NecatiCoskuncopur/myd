'use server';

import bcrypt from 'bcryptjs';
import { ValidationError } from 'yup';

import { messages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { User } from '@/models';
import changePasswordSchema from '@/schema/changePassword.schema';

const changePassword = async (data: IChangePasswordPayload): Promise<IActionResponse> => {
  let validatedData: IChangePasswordPayload;

  try {
    validatedData = await changePasswordSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        status: 'ERROR',
        message: error.errors[0],
      };
    }

    return {
      status: 'ERROR',
      message: messages.GENERAL.UNEXPECTED_ERROR,
    };
  }

  try {
    await connectMongoDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        status: 'ERROR',
        message: messages.GENERAL.UNAUTHORIZED,
      };
    }

    const user = await User.findById(currentUser.id);
    if (!user) {
      return {
        status: 'ERROR',
        message: messages.GENERAL.UNAUTHORIZED,
      };
    }

    if (validatedData.currentPassword === validatedData.newPassword) {
      return {
        status: 'ERROR',
        message: messages.PASSWORD.SAME_AS_OLD,
      };
    }

    const isCorrect = await bcrypt.compare(validatedData.currentPassword, user.password);

    if (!isCorrect) {
      return {
        status: 'ERROR',
        message: messages.PASSWORD.CURRENT_INVALID,
      };
    }

    user.password = await bcrypt.hash(validatedData.newPassword, 12);
    await user.save();

    return {
      status: 'OK',
    };
  } catch (error) {
    console.error('Change Password Error:', error);

    return {
      status: 'ERROR',
      message: messages.GENERAL.UNEXPECTED_ERROR,
    };
  }
};

export default changePassword;
