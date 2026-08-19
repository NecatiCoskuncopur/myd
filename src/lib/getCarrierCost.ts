import { addressMessages, generalMessages, pricingListMessages } from '@/constants';
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

interface IPricing {
  zones: PricingZone[];
}

type CarrierCostResponse = { status: 'OK'; data: number } | { status: 'ERROR'; message: string };

const getCarrierCost = async (pricing: IPricing, weight: number, countryCode: string): Promise<CarrierCostResponse> => {
  try {
    const country = await getCountry(countryCode);

    if (!country) {
      return {
        status: 'ERROR',
        message: addressMessages.COUNTRY.NOT_FOUND,
      };
    }

    const zone = pricing.zones.find(zone => zone.number === country.zone);

    if (!zone) {
      return {
        status: 'ERROR',
        message: pricingListMessages.PRICING.NOT_FOUND,
      };
    }

    const { than, prices } = zone;

    if (!prices.length) {
      return {
        status: 'ERROR',
        message: pricingListMessages.PRICE.NOT_FOUND,
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
      message: pricingListMessages.PRICE.NOT_FOUND,
    };
  } catch (error) {
    return {
      status: 'ERROR',
      message: error instanceof Error ? error.message : generalMessages.UNEXPECTED_ERROR,
    };
  }
};

export default getCarrierCost;
