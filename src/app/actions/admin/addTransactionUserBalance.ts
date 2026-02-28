import { ValidationError } from 'yup';

import { messages } from '@/constants';
import applyBalanceTransaction from '@/lib/applyBalanceTransaction';
import connectMongoDB from '@/lib/db';
import requireRoles from '@/lib/requireRoles';
import addTransactionSchema from '@/schema/addTransaction.schema';

export const addTransactionUserBalance = async (data: IAddTransactionUserBalance): Promise<IActionResponse> => {
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

    return { status: 'OK' };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        status: 'ERROR',
        message: error.errors[0],
      };
    }

    console.error('Add Transaction Error:', error);

    return {
      status: 'ERROR',
      message: messages.GENERAL.UNEXPECTED_ERROR,
    };
  }
};
