import { generalMessages, transactionMessages } from '@/constants';
import { Balance } from '@/models';

type BalanceType = 'SPEND' | 'PAY';

type IBalanceResult = { success: true } | { success: false; message: string };

const { BALANCE } = transactionMessages;
const { UNEXPECTED_ERROR } = generalMessages;

/**
 * Kullanıcının bakiyesine harcama (SPEND) veya yükleme (PAY) işlemi uygular.
 *
 * İşleyiş:
 * - Tutarı 2 ondalık basamağa yuvarlar
 * - SPEND için negatif, PAY için pozitif değer uygular
 * - Kullanıcının toplam bakiyesini $inc ile günceller
 * - İşlem kaydını transactions listesine ekler
 *
 * @param type - İşlem tipi ('SPEND' | 'PAY')
 * @param userId - İşlem yapılacak kullanıcı ID
 * @param amount - İşlem tutarı (ondalıklı olabilir)
 * @param shippingId - (Opsiyonel) İlgili gönderi ID
 * @param note - (Opsiyonel) İşlem açıklaması
 *
 * @returns
 * - { success: true } → İşlem başarılı
 * - { success: false, message } → Hata durumu
 */

const applyBalanceTransaction = async (type: BalanceType, userId: string, amount: number, shippingId?: string, note?: string): Promise<IBalanceResult> => {
  try {
    if (!userId || amount === undefined || amount === null) {
      return {
        success: false,
        message: BALANCE.ERROR,
      };
    }

    const trimmedAmount = Math.round((amount + Number.EPSILON) * 100) / 100;

    const value = type === 'SPEND' ? -Math.abs(trimmedAmount) : type === 'PAY' ? Math.abs(trimmedAmount) : null;

    if (value === null) {
      return {
        success: false,
        message: BALANCE.INVALID,
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
        message: BALANCE.NOT_FOUND,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : UNEXPECTED_ERROR,
    };
  }
};

export default applyBalanceTransaction;
