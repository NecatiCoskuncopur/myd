import { Carrier, carrierConfig } from '@/constants';

const getCarrierTrackingUrl = (carrier: Carrier, trackingNo: string) => {
  const url = carrierConfig[carrier]?.trackingUrl;

  if (!url) {
    return {
      url: null,
      hasLink: false,
    };
  }

  return {
    url: url.replace('%s', trackingNo),
    hasLink: true,
  };
};

export default getCarrierTrackingUrl;
