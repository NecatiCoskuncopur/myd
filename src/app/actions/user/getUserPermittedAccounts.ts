'use server';

import * as Sentry from '@sentry/nextjs';
import { Types } from 'mongoose';

import { generalMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import { CarrierAccount } from '@/models';
import { CarrierAccountTypes } from '@/types/carrierAccount';

const getUserPermittedAccounts = async (): Promise<ResponseTypes.IActionResponse<Partial<CarrierAccountTypes.ICarrierAccount>[]>> => {
  try {
    await connectMongoDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { status: 'ERROR', message: generalMessages.UNAUTHORIZED };
    }

    const permittedIds = currentUser.barcodePermits.reduce<Types.ObjectId[]>((acc, id) => {
      if (Types.ObjectId.isValid(id)) {
        acc.push(new Types.ObjectId(id));
      }
      return acc;
    }, []);

    if (permittedIds.length === 0) {
      return { status: 'OK', data: [] };
    }

    const permittedAccounts = await CarrierAccount.find({
      _id: { $in: currentUser.barcodePermits.filter(id => Types.ObjectId.isValid(id)).map(id => new Types.ObjectId(id)) },
      isActive: true,
    })
      .select('name carrier pricing accountNumber _id')
      .lean();

    return {
      status: 'OK',
      data: JSON.parse(JSON.stringify(permittedAccounts)),
    };
  } catch (error) {
    if (error instanceof Error) {
      Sentry.withScope(scope => {
        scope.setTag('action', 'getUserPermittedAccounts');
        scope.captureException(error);
      });
    }
    return { status: 'ERROR', message: generalMessages.UNEXPECTED_ERROR };
  }
};

export default getUserPermittedAccounts;
