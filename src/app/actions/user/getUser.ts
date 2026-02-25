'use server';

import { messages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { User } from '@/models';

const getUser = async (): Promise<IActionResponse<IUser>> => {
  try {
    await connectMongoDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        status: 'ERROR',
        message: messages.GENERAL.UNAUTHORIZED,
      };
    }

    const userDoc = await User.findById(currentUser.id).select('-password').lean();

    if (!userDoc) {
      return {
        status: 'ERROR',
        message: messages.GENERAL.USER_NOT_FOUND,
      };
    }

    const user: IUser = {
      ...userDoc,
      _id: userDoc._id.toString(),
      priceListId: userDoc.priceListId?.toString(),
    };

    return {
      status: 'OK',
      data: user,
    };
  } catch (error) {
    console.error('Get User Error:', error);

    return {
      status: 'ERROR',
      message: messages.GENERAL.UNEXPECTED_ERROR,
    };
  }
};

export default getUser;
