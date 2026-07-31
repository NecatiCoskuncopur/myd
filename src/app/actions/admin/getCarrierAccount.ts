'use server';

import * as Sentry from '@sentry/nextjs';
import { isValidObjectId } from 'mongoose';

import { carrierMessages, generalMessages, UserRole } from '@/constants';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import { CarrierAccount } from '@/models';
import { CarrierAccountTypes } from '@/types/carrierAccount';

const getCarrierAccount = async (id: string): Promise<ResponseTypes.IActionResponse<CarrierAccountTypes.ICarrierAccount>> => {
  try {
    const authError = await requireRoles([UserRole.ADMIN, UserRole.OPERATOR]);
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
      data: JSON.parse(JSON.stringify(account)),
    };
  } catch (error: unknown) {
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
