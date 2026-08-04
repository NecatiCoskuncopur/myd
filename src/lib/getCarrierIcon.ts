import { Carrier, carrierConfig } from '@/constants';

const getCarrierIcon = (carrier: Carrier) => {
  return carrierConfig[carrier]?.icon ?? null;
};

export default getCarrierIcon;
