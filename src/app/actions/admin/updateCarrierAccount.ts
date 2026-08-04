'use server';

import * as Sentry from '@sentry/nextjs';
import { ValidationError } from 'yup';
import { carrierMessages, generalMessages, UserRole } from '@/constants';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import { CarrierAccount } from '@/models';
import updateCarrierAccountSchema from '@/schemas/updateCarrierAccount.schema';
import { CarrierAccountTypes } from '@/types/carrierAccount';

const updateCarrierAccount = async (data: CarrierAccountTypes.IUpdateCarrierAccountPayload): Promise<ResponseTypes.IActionResponse> => {
  try {
    const authError = await requireRoles([UserRole.ADMIN, UserRole.OPERATOR]);
    if (authError) return authError;
    const validatedData = await updateCarrierAccountSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });
    await connectMongoDB();

    const { id, ...updateFields } = validatedData;

    const updateData = {
      $set: updateFields,
      ...(!updateFields.hasCustomInfo && {
        $unset: {
          customInfo: 1,
        },
      }),
    };

    const updatedAccount = await CarrierAccount.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

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
        scope.setTag('action', 'updateCarrierAccount');
        scope.captureException(error);
      });
    }

    return {
      status: 'ERROR',
      message: generalMessages.UNEXPECTED_ERROR,
    };
  }
};

export default updateCarrierAccount;
