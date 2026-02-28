'use server';

import { ValidationError } from 'yup';

import { messages } from '@/constants';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import { User } from '@/models';
import setUserSchema from '@/schema/setUser.schema';

const setUser = async (data: ISetUserPayload): Promise<IActionResponse> => {
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
        message: messages.GENERAL.USER_NOT_FOUND,
      };
    }

    return { status: 'OK' };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        status: 'ERROR',
        message: error.errors.join(', '),
      };
    }

    console.error('Set User Error:', error);

    return {
      status: 'ERROR',
      message: messages.GENERAL.UNEXPECTED_ERROR,
    };
  }
};

export default setUser;
