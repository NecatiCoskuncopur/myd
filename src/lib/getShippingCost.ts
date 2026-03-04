import { messages } from '@/constants';
import { PricingList } from '@/models';
import getCountry from './getCountry';

const { ADDRESS, GENERAL, PRICE, PRICING } = messages;

interface PriceItem {
  weight: number;
  price: number;
}

interface PricingZone {
  number: number;
  than: number;
  prices: PriceItem[];
}

interface PricingListZoneResult {
  zone: PricingZone[];
}

type ShippingCostResponse = { status: 'OK'; data: number } | { status: 'ERROR'; message: string };

/**
 * Kullanıcının bağlı olduğu fiyat listesi ve hedef ülkeye göre
 * kargo ücretini hesaplar.
 *
 * İşleyiş:
 * - Ülke koduna göre ülkenin zone bilgisi alınır
 * - İlgili pricing list içinde matching zone bulunur
 * - Ağırlık, zone içindeki fiyat tablosuna göre hesaplanır
 * - Eğer ağırlık tabloda bulunan maksimum değeri aşarsa,
 *   zone.than katsayısı ile çarpılarak ücret hesaplanır
 * - Ağırlık doğrudan eşleşmezse 0.5 kg artışlarla en yakın üst değere bakılır
 *
 * @param pricingListId - Kullanıcının bağlı olduğu fiyat listesi ID'si
 * @param weight - Paket ağırlığı (kg)
 * @param countryCode - ISO ülke kodu (örn: TR, US)
 *
 * @returns
 * - { status: 'OK', data: number } → Hesaplanan kargo ücreti
 * - { status: 'ERROR', message: string } → Hata durumu
 */

const getShippingCost = async (pricingListId: string, weight: number, countryCode: string): Promise<ShippingCostResponse> => {
  try {
    const country = await getCountry(countryCode);

    if (!country) {
      return {
        status: 'ERROR',
        message: ADDRESS.COUNTRY.NOT_FOUND,
      };
    }

    const pricing = await PricingList.findOne<PricingListZoneResult>(
      {
        _id: pricingListId,
        'zone.number': country.zone,
      },
      {
        'zone.$': 1,
      },
    ).lean();

    if (!pricing || !pricing.zone?.length) {
      return {
        status: 'ERROR',
        message: PRICING.NOT_FOUND,
      };
    }

    const [{ than, prices }] = pricing.zone;

    const weights = prices.map((item: PriceItem) => item.weight);
    const maxWeight = Math.max(...weights);

    if (weight > maxWeight) {
      return {
        status: 'OK',
        data: weight * than,
      };
    }

    let currentWeight = weight;

    while (currentWeight <= maxWeight) {
      const result = prices.find((item: PriceItem) => Math.abs(item.weight - currentWeight) < 0.0001);

      if (result) {
        return {
          status: 'OK',
          data: result.price,
        };
      }

      currentWeight += 0.5;
    }

    return {
      status: 'ERROR',
      message: PRICE.NOT_FOUND,
    };
  } catch (error) {
    return {
      status: 'ERROR',
      message: error instanceof Error ? error.message : GENERAL.UNEXPECTED_ERROR,
    };
  }
};

export default getShippingCost;
