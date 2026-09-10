import * as Sentry from '@sentry/nextjs';

import { carrierBaseUrl } from '@/constants';
import { CarrierTypes } from '@/types/carrier';

const cancelUpsShipping = async (params: CarrierTypes.ICancelShippingParams) => {
  const { credentials, trackingNumber } = params;

  const authRes = await fetch(`${carrierBaseUrl.UPS}/security/v1/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
    }),
  });

  if (!authRes.ok) {
    const responseText = await authRes.text();

    throw new Error(`UPS authentication failed: HTTP ${authRes.status} - ${responseText}`);
  }

  const authData = await authRes.json();

  const response = await fetch(`${carrierBaseUrl.UPS}/api/shipments/v2409/void/cancel/${trackingNumber}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${authData.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const responseText = await response.text();

    const error = new Error(`UPS shipment cancellation failed: HTTP ${response.status} - ${responseText}`);

    Sentry.captureException(error, {
      extra: {
        carrier: 'UPS',
        responseStatus: response.status,
        responseBody: responseText,
        endpoint: `${carrierBaseUrl.UPS}/api/shipments/v2409/void/cancel/${trackingNumber}`,
        trackingNumber,
      },
    });

    throw error;
  }

  return response.json();
};

export default cancelUpsShipping;
