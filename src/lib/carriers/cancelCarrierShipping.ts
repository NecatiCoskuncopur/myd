import cancelFedexShipping from '@/lib/carriers/fedex/cancelFedexShipping';
import cancelQuickShipperShipping from '@/lib/carriers/quickShipper/cancelQuickShipperShipping';
import cancelUpsShipping from '@/lib/carriers/ups/cancelUpsShipping';
import { CarrierTypes } from '@/types/carrier';

type CancelShippingDriver = (params: CarrierTypes.ICancelShippingParams) => Promise<unknown>;

const cancelShippingDrivers: Record<string, CancelShippingDriver> = {
  FEDEX: cancelFedexShipping,
  UPS: cancelUpsShipping,
  QUICKSHIPPER: cancelQuickShipperShipping,
};

interface CancelCarrierShippingParams extends Omit<CarrierTypes.ICancelShippingParams, 'credentials'> {
  firm: string;

  credentials: {
    key: string;
    value: string;
  }[];
}

const cancelCarrierShipping = async ({ firm, credentials: credentialItems, ...params }: CancelCarrierShippingParams) => {
  const driver = cancelShippingDrivers[firm];

  if (!driver) {
    throw new Error(`Unsupported carrier: ${firm}`);
  }

  const credentials = credentialItems.reduce<Record<string, string>>((acc, item) => {
    acc[item.key] = item.value;
    return acc;
  }, {});

  return driver({
    ...params,
    credentials,
  });
};

export default cancelCarrierShipping;
