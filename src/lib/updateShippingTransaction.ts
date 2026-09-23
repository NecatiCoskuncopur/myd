import mongoose from 'mongoose';

import { generalMessages, transactionMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { Transaction, User } from '@/models';

type IBalanceResult = { success: true } | { success: false; message: string };

const { BALANCE } = transactionMessages;
const { UNEXPECTED_ERROR } = generalMessages;

/**
 * Mevcut kargonun tekil harcama (SPEND) kaydını revize eder.
 * Yeni satır açmaz, mevcut tutarı günceller ve aradaki farkı User.balance alanına yansıtır.
 *
 * @param shippingId - Güncellenecek kargonun ID'si
 * @param newTotalAmount - Kargonun yeni nihai tutarı
 */
const updateShippingTransaction = async (shippingId: string, newTotalAmount: number): Promise<IBalanceResult> => {
  await connectMongoDB();

  if (!shippingId || newTotalAmount === undefined || newTotalAmount === null || isNaN(newTotalAmount)) {
    return {
      success: false,
      message: BALANCE.ERROR,
    };
  }

  const targetAmount = Math.round((Math.abs(newTotalAmount) + Number.EPSILON) * 100) / 100;
  const session = await mongoose.startSession();

  try {
    let result: IBalanceResult = { success: true };

    await session.withTransaction(async () => {
      const existingTx = await Transaction.findOne({
        shippingId,
        transactionType: 'SPEND',
      }).session(session);

      if (!existingTx) {
        result = {
          success: false,
          message: BALANCE.NOT_FOUND,
        };
        throw new Error('TRANSACTION_NOT_FOUND');
      }

      const difference = Math.round((targetAmount - existingTx.amount + Number.EPSILON) * 100) / 100;

      if (difference !== 0) {
        const updatedUser = await User.findByIdAndUpdate(existingTx.userId, { $inc: { balance: -difference } }, { session, new: true });

        if (!updatedUser) {
          result = {
            success: false,
            message: BALANCE.NOT_FOUND,
          };
          throw new Error('USER_NOT_FOUND');
        }

        existingTx.amount = targetAmount;
        await existingTx.save({ session });
      }
    });

    return result;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'TRANSACTION_NOT_FOUND' || error.message === 'USER_NOT_FOUND') {
        return {
          success: false,
          message: BALANCE.NOT_FOUND,
        };
      }
      return {
        success: false,
        message: error.message,
      };
    }

    return {
      success: false,
      message: UNEXPECTED_ERROR,
    };
  } finally {
    await session.endSession();
  }
};

export default updateShippingTransaction;
