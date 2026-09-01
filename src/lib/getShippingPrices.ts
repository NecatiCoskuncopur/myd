import { countries } from '@/constants';
import { CarrierAccountTypes } from '@/types/carrierAccount';
import { PricingListTypes } from '@/types/pricingList';

interface GetShippingPricesParams {
  countryCode: string;
  weight: number;
  carrierPricing?: CarrierAccountTypes.IPricing;
  customerPricing?: PricingListTypes.IPricingList | null;
}

interface PriceZone {
  number: number;
  than: number;
  prices: {
    weight: number;
    price: number;
  }[];
}

const calculatePrice = ({ weight, zone }: { weight: number; zone?: PriceZone }) => {
  if (!zone) {
    return null;
  }

  const price = zone.prices.find(item => weight <= item.weight);

  if (price) {
    return price.price;
  }

  const lastPrice = zone.prices.toSorted((a, b) => a.weight - b.weight).at(-1);

  if (!lastPrice) {
    return null;
  }

  const extraWeight = weight - lastPrice.weight;

  return lastPrice.price + extraWeight * zone.than;
};

export const getShippingPrices = ({ countryCode, weight, carrierPricing, customerPricing }: GetShippingPricesParams) => {
  const country = countries.find(country => country.code === countryCode);

  if (!country) {
    return {
      cost: null,
      customerPrice: null,
    };
  }

  const carrierZone = carrierPricing?.zones.find(zone => zone.number === country.zone);

  const customerZone = customerPricing?.zone.find(zone => zone.number === country.zone);

  return {
    cost: calculatePrice({
      weight,
      zone: carrierZone,
    }),
    customerPrice: calculatePrice({
      weight,
      zone: customerZone,
    }),
  };
};
