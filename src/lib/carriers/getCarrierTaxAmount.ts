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

interface GetCarrierTaxAmountParams extends CarrierTypes.ICarrierTaxParams {
  firm: string;
}

const getCarrierTaxAmount = async ({ firm, ...params }: GetCarrierTaxAmountParams): Promise<number> => {
  const handler = carrierTaxHandlers[firm];

  if (!handler) {
    throw new Error(`Unsupported carrier: ${firm}`);
  }

  return handler(params);
};

export default getCarrierTaxAmount;
