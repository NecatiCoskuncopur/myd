'use server';

import { ValidationError } from 'yup';

import { generalMessages, userMessages } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import isMongoDuplicateKeyError from '@/lib/isMongoDuplicateKeyError';
import { User } from '@/models';
import editUserSchema from '@/schemas/editUser.schema';
import { UserTypes } from '@/types/user';

const { EDITUSER, EMAIL, NOT_FOUND } = userMessages;
const { UNAUTHORIZED, UNEXPECTED_ERROR } = generalMessages;

const editUser = async (data: UserTypes.IEditUserPayload): Promise<ResponseTypes.IActionResponse> => {
  try {
    const validatedData = await editUserSchema.validate(data, {
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

    const user = await User.findByIdAndUpdate(
      currentUser.id,
      { $set: validatedData },
      {
        runValidators: true,
      },
    );

    if (!user) {
      return {
        status: 'ERROR',
        message: NOT_FOUND,
      };
    }

    return {
      status: 'OK',
      message: EDITUSER.SUCCESS,
    };
  } catch (error) {
    if (isMongoDuplicateKeyError(error)) {
      return {
        status: 'ERROR',
        message: EMAIL.EXIST,
      };
    }

    if (error instanceof ValidationError) {
      return {
        status: 'ERROR',
        message: error.errors.join(', '),
      };
    }

    if (error instanceof Error) {
      captureActionError('editUser', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default editUser;
