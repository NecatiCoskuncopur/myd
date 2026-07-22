import React from 'react';
import { SiFedex, SiUps } from 'react-icons/si';
import { FaShippingFast } from 'react-icons/fa';

export interface ICarrierIcon {
  name: string;
  icon: React.ReactNode;
}

export const carrierIcons: Record<string, ICarrierIcon> = {
  FEDEX: {
    name: 'FedEx',
    icon: <SiFedex size={24} />,
  },
  UPS: {
    name: 'UPS',
    icon: <SiUps size={24} />,
  },
};

/**
 * Carrier adına göre isim ve ikon bilgisini güvenli bir şekilde döndürür.
 * Eşleşme yoksa varsayılan kargo ikonunu basar.
 */
export const getCarrierIcon = (carrierKey?: string): ICarrierIcon => {
  if (!carrierKey) {
    return { name: '-', icon: <FaShippingFast size={18} /> };
  }

  const key = carrierKey.trim().toUpperCase();

  return (
    carrierIcons[key] || {
      name: carrierKey,
      icon: <FaShippingFast size={18} />,
    }
  );
};
