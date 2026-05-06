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
      _id: { $in: currentUser.barcodePermits.filter(id => Types.ObjectId.isValid(id)).map(id => new Types.ObjectId(id)) },
      isActive: true,
    })
      .select('name carrier accountNumber _id')
      .lean();

    const data = permittedAccounts.map(account => ({
      _id: account._id.toString(),
      name: account.name,
      carrier: account.carrier as 'FEDEX' | 'UPS',
      accountNumber: account.accountNumber,
    }));

    return {
      status: 'OK',
      data,
    };
  } catch (error) {
    if (error instanceof Error) {
      Sentry.captureException(error);
    }
    return { status: 'ERROR', message: generalMessages.UNEXPECTED_ERROR };
  }
};

export default getUserPermittedAccounts;
