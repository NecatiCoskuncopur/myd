'use server';

import * as Sentry from '@sentry/nextjs';
import { isValidObjectId } from 'mongoose';

import { carrierMessages, generalMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import { CarrierAccount } from '@/models';

const getCarrierAccount = async (id: string): Promise<ResponseTypes.IActionResponse<CarrierAccountTypes.ICarrierAccount>> => {
  try {
    const authError = await requireRoles(['ADMIN', 'OPERATOR']);
    if (authError) return authError;

    if (!isValidObjectId(id)) {
      return {
        status: 'ERROR',
        message: carrierMessages.INVALID_ID,
      };
    }

    await connectMongoDB();

    const account = await CarrierAccount.findById(id).lean();

    if (!account) {
      return {
        status: 'ERROR',
        message: carrierMessages.CARRIER.NOT_FOUND,
      };
    }

    return {
      status: 'OK',
      data: account as CarrierAccountTypes.ICarrierAccount,
    };
  } catch (error) {
    if (error instanceof Error) {
      Sentry.captureException(error);
    }

    return {
      status: 'ERROR',
      message: generalMessages.UNEXPECTED_ERROR,
    };
  }
};

export default getCarrierAccount;
