'use server';

import * as Sentry from '@sentry/nextjs';
import { ValidationError } from 'yup';

import { carrierMessages, generalMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import { CarrierAccount } from '@/models';
import createCarrierAccountSchema from '@/schemas/createCarrierAccount.schema';

const createCarrierAccount = async (data: CarrierAccountTypes.ICreateCarrierAccountPayload): Promise<ResponseTypes.IActionResponse> => {
  try {
    const authError = await requireRoles(['ADMIN', 'OPERATOR']);
    if (authError) return authError;

    await connectMongoDB();

    const validatedData = await createCarrierAccountSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    const existingAccount = await CarrierAccount.findOne({
      carrier: validatedData.carrier,
      accountNumber: validatedData.accountNumber,
    });

    if (existingAccount) {
      return {
        status: 'ERROR',
        message: carrierMessages.ACCOUNTNUMBER.ALREADY_EXISTS,
      };
    }

    await CarrierAccount.create({
      ...validatedData,
      isActive: true,
    });

    return {
      status: 'OK',
      message: carrierMessages.CREATE.SUCCESS,
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        status: 'ERROR',
        message: error.errors.join(', '),
      };
    }

    if (error instanceof Error) {
      Sentry.captureException(error);
    }

    return {
      status: 'ERROR',
      message: generalMessages.UNEXPECTED_ERROR,
    };
  }
};

export default createCarrierAccount;
