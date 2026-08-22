'use server';

import { Types } from 'mongoose';

import { generalMessages } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import { getCurrentUser } from '@/lib/getCurrentUser';
import serialize from '@/lib/serialize';
import { CarrierAccount } from '@/models';
import { CarrierAccountTypes } from '@/types/carrierAccount';

const { UNAUTHORIZED, UNEXPECTED_ERROR } = generalMessages;

const getUserPermittedAccounts = async (): Promise<ResponseTypes.IActionResponse<CarrierAccountTypes.IUserPermittedAccount[]>> => {
  try {
    await connectMongoDB();

    const currentUser = await getCurrentUser();

    if (!currentUser?.id) {
      return {
        status: 'ERROR',
        message: UNAUTHORIZED,
      };
    }

    const permittedIds = (currentUser.barcodePermits ?? []).reduce<Types.ObjectId[]>((acc, id) => {
      if (Types.ObjectId.isValid(id)) {
        acc.push(new Types.ObjectId(id));
      }

      return acc;
    }, []);

    if (permittedIds.length === 0) {
      return {
        status: 'OK',
        data: [],
      };
    }

    const permittedAccounts = await CarrierAccount.find({
      _id: { $in: permittedIds },
      isActive: true,
    })
      .select('name displayName carrier pricing accountNumber accountType _id')
      .lean();

    return {
      status: 'OK',
      data: serialize<CarrierAccountTypes.IUserPermittedAccount[]>(permittedAccounts),
    };
  } catch (error) {
    if (error instanceof Error) {
      captureActionError('getUserPermittedAccounts', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default getUserPermittedAccounts;
