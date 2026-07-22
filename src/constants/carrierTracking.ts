import React from 'react';

export const carrierTrackingUrls: Record<string, string> = {
  FEDEX: 'https://www.fedex.com/fedextrack/?trknbr=%s',
  UPS: 'https://www.ups.com/track?tracknum=%s',
};

export interface ICarrierTracking {
  url: string | null;
  hasLink: boolean;
}

/**
 * Carrier anahtarı ve takip numarasına göre yönlendirme URL'i oluşturur.
 * Eşleşme yoksa veya takip no boşsa null döndürür.
 */
export const getCarrierTrackingUrl = (carrierKey?: string, trackingNumber?: string): ICarrierTracking => {
  if (!carrierKey || !trackingNumber) {
    return { url: null, hasLink: false };
  }

  const key = carrierKey.trim().toUpperCase();
  const cleanTrackingNo = trackingNumber.trim();

  const urlTemplate = carrierTrackingUrls[key];

  if (!urlTemplate) {
    return { url: null, hasLink: false };
  }

  return {
    url: urlTemplate.replace('%s', encodeURIComponent(cleanTrackingNo)),
    hasLink: true,
  };
};
