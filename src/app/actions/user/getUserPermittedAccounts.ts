'use server';

import * as Sentry from '@sentry/nextjs';
import { Types } from 'mongoose';

import { generalMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { CarrierAccount } from '@/models';

const getUserPermittedAccounts = async (): Promise<ResponseTypes.IActionResponse<Partial<CarrierAccountTypes.ICarrierAccount>[]>> => {
  try {
    await connectMongoDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { status: 'ERROR', message: generalMessages.UNAUTHORIZED };
    }

    if (!currentUser.barcodePermits || currentUser.barcodePermits.length === 0) {
      return { status: 'OK', data: [] };
    }

    const permittedAccounts = await CarrierAccount.find({
      _id: { $in: currentUser.barcodePermits.map(permit => new Types.ObjectId(permit)) },
      isActive: true,
    })
      .select('name carrier accountNumber _id')
      .lean();

    const serializedData = JSON.parse(JSON.stringify(permittedAccounts));
    return {
      status: 'OK',
      data: serializedData,
    };
  } catch (error) {
    if (error instanceof Error) {
      Sentry.captureException(error);
    }
    return { status: 'ERROR', message: generalMessages.UNEXPECTED_ERROR };
  }
};

export default getUserPermittedAccounts;
