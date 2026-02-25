'use server';

import { ValidationError } from 'yup';

import { messages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { User } from '@/models';
import editUserSchema from '@/schema/editUser.schema';

const editUser = async (data: IEditUserPayload): Promise<IActionResponse> => {
  let validatedData: IEditUserPayload;

  try {
    validatedData = await editUserSchema.validate(data, {
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

    const { firstName, lastName, company, phone, email, address } = validatedData;

    if (email !== currentUser.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return {
          status: 'ERROR',
          message: messages.EMAIL.EXIST,
        };
      }
    }

    const user = await User.findByIdAndUpdate(
      currentUser.id,
      {
        $set: { firstName, lastName, company, phone, email, address },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!user) {
      return {
        status: 'ERROR',
        message: messages.GENERAL.USER_NOT_FOUND,
      };
    }

    return {
      status: 'OK',
    };
  } catch (error) {
    console.error('Edit User Error:', error);

    return {
      status: 'ERROR',
      message: messages.GENERAL.UNEXPECTED_ERROR,
    };
  }
};

export default editUser;
