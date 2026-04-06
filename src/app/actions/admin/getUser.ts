'use server';

import * as Sentry from '@sentry/nextjs';
import { Types } from 'mongoose';

import { generalMessages, userMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { User } from '@/models';

const getUser = async (userId: string): Promise<ResponseTypes.IActionResponse<UserTypes.IUser>> => {
  try {
    if (!Types.ObjectId.isValid(userId)) {
      return {
        status: 'ERROR',
        message: userMessages.NOT_FOUND,
      };
    }
    await connectMongoDB();

    const userDoc = await User.findById(userId).select('-password').lean();

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
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
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
