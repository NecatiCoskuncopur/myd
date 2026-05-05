import { addressMessages, generalMessages, pricingListMessages } from '@/constants';
import { PricingList } from '@/models';
import getCountry from './getCountry';

const { COUNTRY } = addressMessages;
const { PRICE, PRICING } = pricingListMessages;
const { UNEXPECTED_ERROR } = generalMessages;

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
 * 📦 Hesaplama Mantığı:
 * 1. Ülke koduna göre ülkenin zone bilgisi alınır
 * 2. Kullanıcının pricing list'inde ilgili zone bulunur
 * 3. Ağırlık 0.5 kg adımlarına göre yukarı yuvarlanır (ceil)
 *    Örn:
 *      2.1 → 2.5
 *      2.5 → 2.5
 *      2.6 → 3
 *
 * 4. Eğer ağırlık tabloda birebir varsa → direkt fiyat döner
 *
 * 5. Eğer ağırlık tabloda yoksa:
 *    → 0.5 artışlarla en yakın ÜST değere bakılır
 *    Örn:
 *      tablo: [1, 2]
 *      input: 1.3 → 1.5 → 2 → fiyat
 *
 * 6. Eğer ağırlık maksimum weight'i aşarsa:
 *    → lineer fiyatlandırma uygulanır:
 *
 *      total = maxPrice + (extraWeight × than)
 *
 *    Örn:
 *      tablo:
 *        1 kg → 25
 *        2 kg → 30
 *        than → 5
 *
 *      input: 5 kg
 *
 *      maxWeight = 2
 *      maxPrice = 30
 *      extra = 5 - 2 = 3
 *
 *      total = 30 + (3 × 5) = 45
 *
 * ⚠️ Notlar:
 * - than, maksimum ağırlık sonrası kg başına ek ücret anlamına gelir
 * - Hesaplama tamamen deterministic ve backend tarafında yapılmalıdır
 * - Floating point hatalarını önlemek için exact match kullanılır (===)
 *
 * @param pricingListId - Kullanıcının bağlı olduğu fiyat listesi ID'si
 * @param weight - Paket ağırlığı (kg cinsinden, decimal olabilir)
 * @param countryCode - ISO ülke kodu (örn: TR, US)
 *
 * @returns
 * - { status: 'OK', data: number } → Hesaplanan kargo ücreti
 * - { status: 'ERROR', message: string } → Hata mesajı
 */

const getShippingCost = async (pricingListId: string, weight: number, countryCode: string): Promise<ShippingCostResponse> => {
  try {
    const country = await getCountry(countryCode);

    if (!country) {
      return {
        status: 'ERROR',
        message: COUNTRY.NOT_FOUND,
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

    if (!prices.length) {
      return {
        status: 'ERROR',
        message: PRICE.NOT_FOUND,
      };
    }

    const sortedPrices = [...prices].sort((a, b) => a.weight - b.weight);

    const maxItem = sortedPrices[sortedPrices.length - 1];

    const normalizeWeight = (w: number) => Math.ceil(w * 2) / 2;

    const normalizedWeight = normalizeWeight(weight);

    if (normalizedWeight > maxItem.weight) {
      const extra = normalizedWeight - maxItem.weight;

      return {
        status: 'OK',
        data: maxItem.price + extra * than,
      };
    }

    let currentWeight = normalizedWeight;

    while (currentWeight <= maxItem.weight) {
      const result = sortedPrices.find(item => item.weight === currentWeight);

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
      message: error instanceof Error ? error.message : UNEXPECTED_ERROR,
    };
  }
};

export default getShippingCost;
