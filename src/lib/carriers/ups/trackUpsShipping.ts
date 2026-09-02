import * as Sentry from '@sentry/nextjs';

import { CarrierTypes } from '@/types/carrier';

const BASE_URL = 'https://wwwcie.ups.com';

const trackUpsShipping = async (params: CarrierTypes.ITrackingParams) => {
  const { credentials, trackingNumber } = params;

  const authRes = await fetch(`${BASE_URL}/api/oauth/v1/token`, {
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

    const error = new Error(`UPS authentication failed: HTTP ${authRes.status} - ${responseText}`);

    Sentry.captureException(error, {
      extra: {
        carrier: 'UPS',
        operation: 'TRACK_SHIPMENT_AUTH',
        responseStatus: authRes.status,
        responseBody: responseText,
        endpoint: `${BASE_URL}/api/oauth/v1/token`,
        trackingNumber,
      },
    });

    throw error;
  }

  const authData = await authRes.json();

  const query = new URLSearchParams({
    locale: 'en_US',
    returnSignature: 'false',
    returnMilestones: 'false',
    returnPOD: 'false',
  }).toString();

  const endpoint = `${BASE_URL}/api/track/v1/details/${encodeURIComponent(trackingNumber)}?${query}`;

  const trackingRes = await fetch(endpoint, {
    method: 'GET',
    headers: {
      transId: crypto.randomUUID(),
      transactionSrc: 'testing',
      Authorization: `Bearer ${authData.access_token}`,
    },
  });

  if (!trackingRes.ok) {
    const responseText = await trackingRes.text();

    const error = new Error(`UPS tracking failed: HTTP ${trackingRes.status} - ${responseText}`);

    Sentry.captureException(error, {
      extra: {
        carrier: 'UPS',
        operation: 'TRACK_SHIPMENT',
        responseStatus: trackingRes.status,
        responseBody: responseText,
        endpoint,
        trackingNumber,
      },
    });

    throw error;
  }

  const trackingData = await trackingRes.json();
  const status = trackingData?.trackResponse?.shipment?.[0]?.package?.[0]?.currentStatus?.simplifiedTextDescription;

  if (!status) {
    throw new Error(`UPS tracking status not found: ${trackingNumber}`);
  }

  return status;
};

export default trackUpsShipping;
