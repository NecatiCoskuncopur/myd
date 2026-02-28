import { messages } from '@/constants';
import { PricingList } from '@/models';
import getCountry from './getCountry';

const { COUNTRY, GENERAL, PRICE, PRICING } = messages;

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
 * Kullanıcının fiyat listesine ve hedef ülkeye göre kargo ücretini hesaplar.
 *
 * @param pricingListId - Kullanıcının bağlı olduğu fiyat listesi ID'si
 * @param weight - Paket ağırlığı (kg)
 * @param countryCode - ISO ülke kodu (örn: TR, US)
 * @returns Başarılıysa hesaplanan ücret, hata durumunda mesaj döner
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
    console.error('Get Shipping Cost Error:', error);

    return {
      status: 'ERROR',
      message: GENERAL.UNEXPECTED_ERROR,
    };
  }
};

export default getShippingCost;
