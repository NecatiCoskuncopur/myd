'use server';

import * as Sentry from '@sentry/nextjs';
import { ValidationError } from 'yup';
import { carrierMessages, generalMessages, UserRole } from '@/constants';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import { CarrierAccount } from '@/models';
import createCarrierAccountSchema from '@/schemas/createCarrierAccount.schema';
import { CarrierAccountTypes } from '@/types/carrierAccount';

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
      message: carrierMessages.CREATE.SUCCESS,
    };
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code?: unknown }).code === 11000) {
      return {
        status: 'ERROR',
        message: carrierMessages.ACCOUNTNUMBER.ALREADY_EXISTS,
      };
    }

    if (error instanceof ValidationError) {
      return {
        status: 'ERROR',
        message: error.errors.join(', '),
      };
    }

    if (error instanceof Error) {
      Sentry.withScope(scope => {
        scope.setTag('action', 'createCarrierAccount');
        scope.captureException(error);
      });
    }

    return {
      status: 'ERROR',
      message: generalMessages.UNEXPECTED_ERROR,
    };
  }
};

export default createCarrierAccount;
