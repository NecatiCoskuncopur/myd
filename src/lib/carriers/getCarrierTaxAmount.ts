import { CarrierTypes } from '@/types/carrier';

import getFedexTaxAmount from './fedex/getFedexTaxAmount';
import getQuickShipperTaxAmount from './quickShipper/getQuickShipperTaxAmount';
import getUpsTaxAmount from './ups/getUpsTaxAmount';

type CarrierTaxHandler = (params: CarrierTypes.ICarrierTaxParams) => Promise<number>;

const carrierTaxHandlers: Record<string, CarrierTaxHandler> = {
  FEDEX: getFedexTaxAmount,
  UPS: getUpsTaxAmount,
  QUICKSHIPPER: getQuickShipperTaxAmount,
};

interface GetCarrierTaxAmountParams extends Omit<CarrierTypes.ICarrierTaxParams, 'credentials'> {
  firm: string;

  credentials: {
    key: string;
    value: string;
  }[];
}

const getCarrierTaxAmount = async ({ firm, credentials: credentialItems, ...params }: GetCarrierTaxAmountParams): Promise<number> => {
  const handler = carrierTaxHandlers[firm];

  if (!handler) {
    throw new Error(`Unsupported carrier: ${firm}`);
  }

  const credentials = credentialItems.reduce<Record<string, string>>((acc, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {});

  return handler({
    ...params,
    credentials,
  });
};

export default getCarrierTaxAmount;
