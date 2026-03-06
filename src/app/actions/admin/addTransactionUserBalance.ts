'use server';

import * as Sentry from '@sentry/nextjs';
import { ValidationError } from 'yup';

import { messages } from '@/constants';
import applyBalanceTransaction from '@/lib/applyBalanceTransaction';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import addTransactionSchema from '@/schemas/addTransaction.schema';

const { GENERAL, TRANSACTION } = messages;

const addTransactionUserBalance = async (data: IAddTransactionUserBalancePayload): Promise<IActionResponse> => {
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

    return { status: 'OK', message: TRANSACTION.SUCCESS };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        status: 'ERROR',
        message: error.errors[0],
      };
    }

    if (error instanceof Error) {
      Sentry.captureException(error);
    }

    return {
      status: 'ERROR',
      message: GENERAL.UNEXPECTED_ERROR,
    };
  }
};

export default addTransactionUserBalance;
