'use server';

import * as Sentry from '@sentry/nextjs';
import { ValidationError } from 'yup';

import { carrierMessages, generalMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import { CarrierAccount } from '@/models';
import updateCarrierAccountSchema from '@/schemas/updateCarrierAccount.schema';

const updateCarrierAccount = async (data: CarrierAccountTypes.IUpdateCarrierAccountPayload): Promise<ResponseTypes.IActionResponse> => {
  try {
    const authError = await requireRoles(['ADMIN', 'OPERATOR']);
    if (authError) return authError;

    await connectMongoDB();

    const validatedData = await updateCarrierAccountSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    const { id, ...updateFields } = validatedData;

    const updatedAccount = await CarrierAccount.findByIdAndUpdate(id, { $set: updateFields }, { new: true, runValidators: true });
    if (!updatedAccount) {
      return {
        status: 'ERROR',
        message: carrierMessages.NOT_FOUND,
      };
    }

    return {
      status: 'OK',
      message: carrierMessages.UPDATE.SUCCESS,
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

export default updateCarrierAccount;
