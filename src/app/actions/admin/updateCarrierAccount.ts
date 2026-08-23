'use server';

import { ValidationError } from 'yup';

import { carrierMessages, generalMessages, UserRole } from '@/constants';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import isMongoDuplicateKeyError from '@/lib/isMongoDuplicateKeyError';
import requireRoles from '@/lib/requireRoles';
import { CarrierAccount } from '@/models';
import updateCarrierAccountSchema from '@/schemas/updateCarrierAccount.schema';
import { CarrierAccountTypes } from '@/types/carrierAccount';

const { UNEXPECTED_ERROR } = generalMessages;
const { ACCOUNTNUMBER, NOT_FOUND, UPDATE } = carrierMessages;

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
        message: NOT_FOUND,
      };
    }

    return {
      status: 'OK',
      message: UPDATE.SUCCESS,
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
      captureActionError('updateCarrierAccount', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default updateCarrierAccount;
