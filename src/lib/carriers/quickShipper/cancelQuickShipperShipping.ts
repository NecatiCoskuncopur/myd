import * as Sentry from '@sentry/nextjs';

import { CarrierTypes } from '@/types/carrier';

const BASE_URL = 'https://api.quickshipper.com';

const cancelQuickShipperShipping = async (params: CarrierTypes.ICancelShippingParams) => {
  const { accountNumber, credentials, trackingNumber } = params;

  const endpoint = `${BASE_URL}/api/affiliate/shipments/deleteShipment?AWBNumber=${encodeURIComponent(trackingNumber)}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accountNumber,
      'qs-key': credentials.apiKey,
      'qs-secret': credentials.apiSecret,
    },
  });

  const responseText = await response.text();

  if (!response.ok) {
    const error = new Error(`QuickShipper shipment cancellation failed: HTTP ${response.status} - ${responseText}`);

    Sentry.captureException(error, {
      extra: {
        carrier: 'QUICKSHIPPER',
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

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
  }
};

export default cancelQuickShipperShipping;
