'use server';

import { ValidationError } from 'yup';

import { generalMessages, transactionMessages, UserRole } from '@/constants';
import applyBalanceTransaction from '@/lib/applyBalanceTransaction';
import captureActionError from '@/lib/captureActionError';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import addTransactionSchema from '@/schemas/addTransaction.schema';
import { AdminTypes } from '@/types/admin';

const { SUCCESS } = transactionMessages;
const { UNEXPECTED_ERROR } = generalMessages;

const addTransactionUserBalance = async (data: AdminTypes.IAddTransactionUserBalancePayload): Promise<ResponseTypes.IActionResponse> => {
  try {
    const authError = await requireRoles([UserRole.ADMIN]);
    if (authError) {
      return authError;
    }

    const validatedData = await addTransactionSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    await connectMongoDB();

    const { userId, type, amount, note } = validatedData;

    const result = await applyBalanceTransaction(type, userId, amount, undefined, note);

    if (!result.success) {
      return {
        status: 'ERROR',
        message: result.message,
      };
    }

    return {
      status: 'OK',
      message: SUCCESS,
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        status: 'ERROR',
        message: error.errors.join(', '),
      };
    }

    if (error instanceof Error) {
      captureActionError('addTransactionUserBalance', error);
    }

    return {
      status: 'ERROR',
      message: UNEXPECTED_ERROR,
    };
  }
};

export default addTransactionUserBalance;
