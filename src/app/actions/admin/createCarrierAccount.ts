'use server';

import { ValidationError } from 'yup';

import { carrierMessages, generalMessages, UserRole } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import isMongoDuplicateKeyError from '@/lib/isMongoDuplicateKeyError';
import requireRoles from '@/lib/requireRoles';
import { CarrierAccount } from '@/models';
import createCarrierAccountSchema from '@/schemas/createCarrierAccount.schema';
import { CarrierAccountTypes } from '@/types/carrierAccount';

const { UNEXPECTED_ERROR } = generalMessages;
const { ACCOUNTNUMBER, CREATE } = carrierMessages;

const createCarrierAccount = async (data: CarrierAccountTypes.ICreateCarrierAccountPayload): Promise<ResponseTypes.IActionResponse> => {
  try {
    const authError = await requireRoles([UserRole.ADMIN, UserRole.OPERATOR]);
    if (authError) return authError;

    const validatedData = await createCarrierAccountSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    await connectMongoDB();

    await CarrierAccount.create({
      ...validatedData,
      isActive: true,
    });

    return {
      status: 'OK',
      message: CREATE.SUCCESS,
    };
  } catch (error) {
    if (isMongoDuplicateKeyError(error)) {
      return {
        status: 'ERROR',
        message: ACCOUNTNUMBER.ALREADY_EXISTS,
      };
    }

    if (error instanceof ValidationError) {
      return {
        status: 'ERROR',
        message: error.errors.join(', '),
      };
    }

    if (error instanceof Error) {
      captureActionError('createCarrierAccount', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default createCarrierAccount;
