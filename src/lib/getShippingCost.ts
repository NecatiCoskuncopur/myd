import { PricingList } from '@/models';
import getCountry from './getCountry';

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

const getShippingCost = async (pricingListId: string, weight: number, countryCode: string): Promise<number> => {
  const country = await getCountry(countryCode);

  if (!country) {
    throw new Error('COUNTRY_NOT_FOUND');
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
    throw new Error('PRICING_NOT_FOUND');
  }

  const [{ than, prices }] = pricing.zone;

  const weights = prices.map((item: PriceItem) => item.weight);
  const maxWeight = Math.max(...weights);

  if (weight > maxWeight) {
    return weight * than;
  }

  const calcCost = (currentWeight: number, priceList: PriceItem[]): number => {
    const result = priceList.find(item => item.weight === currentWeight);

    if (result) {
      return result.price;
    }

    return calcCost(currentWeight + 0.5, priceList);
  };

  return calcCost(weight, prices);
};

export default getShippingCost;
