import { countries } from '@/constants';
import { PricingListTypes } from '@/types/pricingList';

interface GetCustomerPriceParams {
  countryCode: string;
  weight: number;
  pricingList?: PricingListTypes.IPricingList | null;
}

/**
 * Ülke ve ağırlık bilgisine göre müşteriye uygulanacak gönderim fiyatını hesaplar.
 *
 * Ülkenin bağlı olduğu fiyatlandırma bölgesini bulur ve ağırlığa uygun ilk fiyatı döndürür.
 * Ağırlık tanımlı en yüksek ağırlık sınırını aşarsa, aşan kısım için bölgenin `than`
 * değeri kullanılarak ek ücret hesaplanır.
 *
 * Fiyat listesi, ülke, bölge veya geçerli fiyat bilgisi bulunamazsa `null` döner.
 *
 * @param params - Fiyat hesaplama parametreleri
 * @param params.countryCode - Gönderinin ülke kodu
 * @param params.weight - Gönderinin hesaplamada kullanılacak ağırlığı
 * @param params.pricingList - Fiyat hesaplamasında kullanılacak müşteri fiyat listesi
 * @returns Hesaplanan gönderim fiyatı veya fiyat hesaplanamazsa `null`
 */

export const getCustomerPrice = ({ countryCode, weight, pricingList }: GetCustomerPriceParams) => {
  if (!pricingList) {
    return null;
  }

  const country = countries.find(country => country.code === countryCode);

  if (!country) {
    return null;
  }

  const pricingZone = pricingList.zone.find(zone => zone.number === country.zone);

  if (!pricingZone) return null;

  const price = pricingZone.prices.find(item => weight <= item.weight);

  if (price) {
    return price.price;
  }

  const lastPrice = pricingZone.prices.sort((a, b) => a.weight - b.weight).at(-1);

  if (!lastPrice) {
    return null;
  }

  const extraWeight = weight - lastPrice.weight;

  return lastPrice.price + extraWeight * pricingZone.than;
};
