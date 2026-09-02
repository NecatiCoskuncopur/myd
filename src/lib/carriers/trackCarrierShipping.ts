import { CarrierTypes } from '@/types/carrier';

import trackFedexShipping from './fedex/trackFedexShipping';
import trackQuickShipperShipping from './quickShipper/trackQuickShipperShipping';
import trackUpsShipping from './ups/trackUpsShipping';

type TrackingDriver = (params: CarrierTypes.ITrackingParams) => Promise<string>;

const trackingDrivers: Record<string, TrackingDriver> = {
  FEDEX: params => trackFedexShipping(params.trackingNumber),
  UPS: trackUpsShipping,
  QUICKSHIPPER: trackQuickShipperShipping,
};

interface TrackCarrierShippingParams extends Omit<CarrierTypes.ITrackingParams, 'credentials'> {
  firm: string;

  credentials: {
    key: string;
    value: string;
  }[];
}

const trackCarrierShipping = async ({ firm, credentials: credentialItems, ...params }: TrackCarrierShippingParams): Promise<string> => {
  const driver = trackingDrivers[firm];

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

export default trackCarrierShipping;
