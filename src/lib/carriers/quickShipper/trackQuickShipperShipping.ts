import * as Sentry from '@sentry/nextjs';

import { CarrierTypes } from '@/types/carrier';

const BASE_URL = 'https://api.quickshipper.com';

const trackQuickShipperShipping = async (params: CarrierTypes.ITrackingParams) => {
  const { accountNumber, credentials, trackingNumber } = params;

  const endpoint = `${BASE_URL}/api/affiliate/shipments/statushistories?AWBNumber=${encodeURIComponent(trackingNumber)}`;

  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      accountNumber,
      'qs-key': credentials.apiKey,
      'qs-secret': credentials.apiSecret,
    },
  });

  if (!response.ok) {
    const responseText = await response.text();

    const error = new Error(`QuickShipper tracking failed: HTTP ${response.status} - ${responseText}`);

    Sentry.captureException(error, {
      extra: {
        carrier: 'QUICKSHIPPER',
        operation: 'TRACK_SHIPMENT',
        responseStatus: response.status,
        responseStatusText: response.statusText,
        responseBody: responseText,
        endpoint,
        trackingNumber,
        accountNumber,
      },
    });

    throw error;
  }

  const trackingData = await response.json();

  const latestStatus = trackingData?.data?.[0];

  return latestStatus?.shippingStatus?.shippingMainStatus?.description;
};

export default trackQuickShipperShipping;
