import React from 'react';
import Image from 'next/image';
import { Carrier } from '@/constants';

export interface ICarrierCredential {
  key: string;
  value: string;
}

export interface ICarrierConfig {
  name: string;
  trackingUrl?: string;
  credentials: ICarrierCredential[];
  icon: React.ReactNode;
}

const carrierConfig: Record<Carrier, ICarrierConfig> = {
  [Carrier.FEDEX]: {
    name: 'FedEx',
    trackingUrl: 'https://www.fedex.com/fedextrack/?trknbr=%s',
    credentials: [
      { key: 'apiKey', value: '' },
      { key: 'secretKey', value: '' },
    ],
    icon: <Image src="/images/fedex.svg" alt="FedEx" width={24} height={24} style={{ objectFit: 'contain' }} />,
  },

  [Carrier.UPS]: {
    name: 'UPS',
    trackingUrl: 'https://www.ups.com/track?tracknum=%s',
    credentials: [
      { key: 'clientId', value: '' },
      { key: 'clientSecret', value: '' },
    ],
    icon: <Image src="/images/ups.svg" alt="UPS" width={24} height={24} style={{ objectFit: 'contain' }} />,
  },
  [Carrier.QUICKSHIPPER]: {
    name: 'QUICKSHIPPER',
    trackingUrl: 'https://www.ups.com/track?tracknum=%s',
    credentials: [
      { key: 'clientId', value: '' },
      { key: 'clientSecret', value: '' },
    ],
    icon: <Image src="/images/qs.png" alt="UPS" width={24} height={24} style={{ objectFit: 'contain' }} />,
  },
};

export default carrierConfig;
