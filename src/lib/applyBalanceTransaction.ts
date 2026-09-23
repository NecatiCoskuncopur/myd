import mongoose from 'mongoose';

import { generalMessages, transactionMessages } from '@/constants';
import connectMongoDB from '@/lib/db';
import { Transaction, User } from '@/models';

type BalanceType = 'SPEND' | 'PAY';

type IBalanceResult = { success: true } | { success: false; message: string };

const { BALANCE } = transactionMessages;
const { UNEXPECTED_ERROR } = generalMessages;

/**
 * Kullanıcının bakiyesine harcama (SPEND) veya yükleme (PAY) işlemi uygular.
 *
 * İşleyiş:
 * - Tutarı 2 ondalık basamağa yuvarlar
 * - SPEND için negatif, PAY için pozitif bakiye artışı hesaplar
 * - MongoDB session kullanarak User.balance değerini $inc ile günceller
 * - Eşzamanlı olarak Transaction koleksiyonuna işlem kaydı ekler
 *
 * @param type - İşlem tipi ('SPEND' | 'PAY')
 * @param userId - İşlem yapılacak kullanıcı ID
 * @param amount - İşlem tutarı (pozitif sayı)
 * @param shippingId - (Opsiyonel) İlgili gönderi ID
 * @param note - (Opsiyonel) İşlem açıklaması
 *
 * @returns
 * - { success: true } → İşlem başarılı
 * - { success: false, message } → Hata durumu
 */
const applyBalanceTransaction = async (type: BalanceType, userId: string, amount: number, shippingId?: string, note?: string): Promise<IBalanceResult> => {
  await connectMongoDB();

  if (!userId || amount === undefined || amount === null || isNaN(amount)) {
    return {
      success: false,
      message: BALANCE.ERROR,
    };
  }

  const trimmedAmount = Math.round((Math.abs(amount) + Number.EPSILON) * 100) / 100;

  if (trimmedAmount <= 0) {
    return {
      success: false,
      message: BALANCE.INVALID,
    };
  }

  const balanceDelta = type === 'SPEND' ? -trimmedAmount : trimmedAmount;

  const session = await mongoose.startSession();

  try {
    let result: IBalanceResult = { success: true };

    await session.withTransaction(async () => {
      const updatedUser = await User.findByIdAndUpdate(userId, { $inc: { balance: balanceDelta } }, { session, new: true });

      if (!updatedUser) {
        result = {
          success: false,
          message: BALANCE.NOT_FOUND,
        };
        throw new Error('USER_NOT_FOUND');
      }

      await Transaction.create(
        [
          {
            userId,
            transactionType: type,
            amount: trimmedAmount,
            shippingId: shippingId || null,
            note: note || null,
          },
        ],
        { session },
      );
    });

    return result;
  } catch (error) {
    if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
      return {
        success: false,
        message: BALANCE.NOT_FOUND,
      };
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : UNEXPECTED_ERROR,
    };
  } finally {
    await session.endSession();
  }
};

export default applyBalanceTransaction;
