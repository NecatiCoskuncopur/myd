'use server';

import * as Sentry from '@sentry/nextjs';

import { generalMessages, userMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { User } from '@/models';

const getUser = async (): Promise<ResponseTypes.IActionResponse<UserTypes.IUser>> => {
  try {
    await connectMongoDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { status: 'ERROR', message: generalMessages.UNAUTHORIZED };
    }

    const userDoc = await User.findById(currentUser.id).select('-password').lean();

    if (!userDoc) {
      return { status: 'ERROR', message: userMessages.NOT_FOUND };
    }

    const cleanUser: UserTypes.IUser = {
      _id: String(userDoc._id),
      email: userDoc.email,
      firstName: userDoc.firstName,
      lastName: userDoc.lastName,
      company: userDoc.company,
      phone: userDoc.phone,
      role: userDoc.role as UserTypes.IUser['role'],
      isActive: userDoc.isActive,
      barcodePermits: userDoc.barcodePermits || [],
      address: userDoc.address,
      priceListId: userDoc.priceListId ? String(userDoc.priceListId) : undefined,
      createdAt: userDoc.createdAt as Date,
      updatedAt: userDoc.updatedAt as Date,
    };

    return {
      status: 'OK',
      data: cleanUser,
    };
  } catch (error) {
    if (error instanceof Error) {
      Sentry.captureException(error);
    }

    return { status: 'ERROR', message: generalMessages.UNEXPECTED_ERROR };
  }
};

export default getUser;
