import { Carrier } from '@/constants';
import { carrierConfig } from '@/constants';

const getCarrierCredentials = (carrier?: Carrier) => {
  if (!carrier) return [];

  return (
    carrierConfig[carrier]?.credentials.map(credential => ({
      ...credential,
    })) ?? []
  );
};

export default getCarrierCredentials;
