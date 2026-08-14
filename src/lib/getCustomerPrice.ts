import { countries } from '@/constants';

interface GetCustomerPriceParams {
  countryCode: string;
  weight: number;
  pricingList?: PricingListTypes.IPricingList | null;
}

export const getCustomerPrice = ({ countryCode, weight, pricingList }: GetCustomerPriceParams) => {
  if (!pricingList) {
    return null;
  }

  const country = countries.find(country => country.code === countryCode);

  if (!country) {
    return null;
  }

  const pricingZone = pricingList.zone.find(zone => zone.number === country.zone);

  if (!pricingZone) {
    return null;
  }

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
