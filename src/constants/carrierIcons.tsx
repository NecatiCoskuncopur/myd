import React from 'react';
import Image from 'next/image';

export interface ICarrierIcon {
  name: string;
  icon: React.ReactNode;
}

export const carrierIcons: Record<string, ICarrierIcon> = {
  FEDEX: {
    name: 'FedEx',
    icon: <Image src="/images/fedex.svg" alt="FedEx" width={24} height={24} style={{ objectFit: 'contain' }} />,
  },
  UPS: {
    name: 'UPS',
    icon: <Image src="/images/ups.svg" alt="UPS" width={24} height={24} style={{ objectFit: 'contain' }} />,
  },
};

/**
 * Carrier adına göre isim ve ikon bilgisini güvenli bir şekilde döndürür.
 * Eşleşme yoksa ikon alanını null döner.
 */
export const getCarrierIcon = (carrierKey?: string): ICarrierIcon => {
  if (!carrierKey) {
    return { name: '-', icon: null };
  }

  const key = carrierKey.trim().toUpperCase();

  return (
    carrierIcons[key] || {
      name: carrierKey,
      icon: null,
    }
  );
};
