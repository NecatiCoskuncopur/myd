'use server';

import { Types } from 'mongoose';

import { generalMessages, userMessages } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import serialize from '@/lib/serialize';
import { User } from '@/models';
import { UserTypes } from '@/types/user';

const { UNEXPECTED_ERROR } = generalMessages;
const { NOT_FOUND } = userMessages;

const getUser = async (userId: string): Promise<ResponseTypes.IActionResponse<UserTypes.UserDto>> => {
  try {
    if (!Types.ObjectId.isValid(userId)) {
      return {
        status: 'ERROR',
        message: NOT_FOUND,
      };
    }
    await connectMongoDB();

    const userDoc = await User.findById(userId).select('-password').lean();

    if (!userDoc) {
      return {
        status: 'ERROR',
        message: NOT_FOUND,
      };
    }

    return {
      status: 'OK',
      data: serialize<UserTypes.UserDto>(userDoc),
    };
  } catch (error) {
    if (error instanceof Error) {
      captureActionError('getUser', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default getUser;
