'use server';

import * as Sentry from '@sentry/nextjs';
import { ValidationError } from 'yup';

import { generalMessages, transactionMessages } from '@/constants';
import applyBalanceTransaction from '@/lib/applyBalanceTransaction';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import addTransactionSchema from '@/schemas/addTransaction.schema';

const { SUCCESS } = transactionMessages;
const { UNEXPECTED_ERROR } = generalMessages;

const addTransactionUserBalance = async (data: AdminTypes.IAddTransactionUserBalancePayload): Promise<ResponseTypes.IActionResponse> => {
  try {
    const authError = await requireRoles(['ADMIN']);
    if (authError) return authError;

    await connectMongoDB();

    const validatedData = await addTransactionSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    const { userId, type, amount, note } = validatedData;

    const result = await applyBalanceTransaction(type, userId, amount, undefined, note);

    if (!result.success) {
      return {
        status: 'ERROR',
        message: result.message,
      };
    }

    return { status: 'OK', message: SUCCESS };
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
      message: UNEXPECTED_ERROR,
    };
  }
};

export default addTransactionUserBalance;
