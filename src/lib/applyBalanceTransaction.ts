import { messages } from '@/constants';
import Balance from '@/models/Balance.model';

type BalanceType = 'SPEND' | 'PAY';

type IBalanceResult = { success: true } | { success: false; message: string };

/**
 * Kullanıcının bakiyesine işlem uygular (harcama veya yükleme)
 *
 * @param type - İşlem tipi ('SPEND' | 'PAY')
 * @param userId - Kullanıcı ID
 * @param amount - İşlem tutarı
 * @param shippingId - (opsiyonel) gönderi ilişkisi
 * @param note - (opsiyonel) açıklama
 * @returns İşlem sonucu (başarılı / hatalı)
 */

const applyBalanceTransaction = async (type: BalanceType, userId: string, amount: number, shippingId?: string, note?: string): Promise<IBalanceResult> => {
  try {
    if (!userId || amount === undefined || amount === null) {
      return {
        success: false,
        message: messages.BALANCE.ERROR,
      };
    }

    const trimmedAmount = Math.round((amount + Number.EPSILON) * 100) / 100;

    const value = type === 'SPEND' ? -Math.abs(trimmedAmount) : type === 'PAY' ? Math.abs(trimmedAmount) : null;

    if (value === null) {
      return {
        success: false,
        message: messages.BALANCE.INVALID,
      };
    }

    const result = await Balance.updateOne(
      { userId },
      {
        $inc: { total: value },
        $push: {
          transactions: {
            transactionType: type,
            amount: value,
            shippingId,
            note,
          },
        },
      },
      { runValidators: true },
    );

    if (result.matchedCount === 0) {
      return {
        success: false,
        message: 'BALANCE_NOT_FOUND',
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Balance işleminde hata oluştu',
    };
  }
};

export default applyBalanceTransaction;
