import { CarrierTypes } from '@/types/carrier';

const getFedexTaxAmount = async (params: CarrierTypes.ICarrierTaxParams): Promise<number> => {
  // TODO: FedEx duties & taxes API entegrasyonu yapılacak.

  return 0;
};

export default getFedexTaxAmount;
