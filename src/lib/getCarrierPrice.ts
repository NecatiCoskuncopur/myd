import { countries } from '@/constants';
import { CarrierAccountTypes } from '@/types/carrierAccount';

interface GetCarrierPriceParams {
  countryCode: string;
  weight: number;
  pricing?: CarrierAccountTypes.IPricing;
}

export const getCarrierPrice = ({ countryCode, weight, pricing }: GetCarrierPriceParams) => {
  if (!pricing) {
    return null;
  }

  const country = countries.find(country => country.code === countryCode);

  if (!country) {
    return null;
  }

  const pricingZone = pricing.zones.find(zone => zone.number === country.zone);

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
