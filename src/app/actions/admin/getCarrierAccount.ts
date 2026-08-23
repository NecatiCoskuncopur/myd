'use server';

import { isValidObjectId } from 'mongoose';

import { carrierMessages, generalMessages, UserRole } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import serialize from '@/lib/serialize';
import { CarrierAccount } from '@/models';
import { CarrierAccountTypes } from '@/types/carrierAccount';

const { CARRIER, INVALID_ID } = carrierMessages;
const { UNEXPECTED_ERROR } = generalMessages;

const getCarrierAccount = async (id: string): Promise<ResponseTypes.IActionResponse<CarrierAccountTypes.ICarrierAccount>> => {
  try {
    const authError = await requireRoles([UserRole.ADMIN, UserRole.OPERATOR]);
    if (authError) return authError;

    if (!isValidObjectId(id)) {
      return {
        status: 'ERROR',
        message: INVALID_ID,
      };
    }

    await connectMongoDB();

    const account = await CarrierAccount.findById(id).lean();

    if (!account) {
      return {
        status: 'ERROR',
        message: CARRIER.NOT_FOUND,
      };
    }

    return {
      status: 'OK',
      data: serialize<CarrierAccountTypes.ICarrierAccount>(account),
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      captureActionError('getCarrierAccount', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default getCarrierAccount;
