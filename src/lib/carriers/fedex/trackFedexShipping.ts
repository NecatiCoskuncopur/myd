import * as Sentry from '@sentry/nextjs';

import { carrierMessages } from '@/constants';
import env from '@/lib/env';

const { AUTH_FAILED } = carrierMessages;

const BASE_URL = 'https://apis-sandbox.fedex.com';

const trackFedexShipping = async (trackingNumber: string) => {
  const authRes = await fetch(`${BASE_URL}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: env.FEDEX_TRACKING_API_KEY,
      client_secret: env.FEDEX_TRACKING_SECRET_KEY,
    }),
  });

  if (!authRes.ok) {
    const responseText = await authRes.text();

    const error = new Error(`${AUTH_FAILED}: HTTP ${authRes.status} - ${responseText}`);

    Sentry.captureException(error, {
      extra: {
        carrier: 'FEDEX',
        operation: 'TRACK_SHIPMENT_AUTH',
        responseStatus: authRes.status,
        responseBody: responseText,
        endpoint: `${BASE_URL}/oauth/token`,
        trackingNumber,
      },
    });

    throw error;
  }

  const authData = await authRes.json();

  const payload = {
    includeDetailedScans: false,
    trackingInfo: [
      {
        trackingNumberInfo: {
          trackingNumber,
        },
      },
    ],
  };

  const trackingRes = await fetch(`${BASE_URL}/track/v1/trackingnumbers`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authData.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!trackingRes.ok) {
    const responseText = await trackingRes.text();

    const error = new Error(`FedEx tracking failed: HTTP ${trackingRes.status} - ${responseText}`);

    Sentry.captureException(error, {
      extra: {
        carrier: 'FEDEX',
        operation: 'TRACK_SHIPMENT',
        responseStatus: trackingRes.status,
        responseBody: responseText,
        endpoint: `${BASE_URL}/track/v1/trackingnumbers`,
        trackingNumber,
      },
    });

    throw error;
  }

  const trackingData = await trackingRes.json();
  return trackingData?.output?.completeTrackResults?.[0]?.trackResults?.[0]?.latestStatusDetail?.statusByLocale;
};

export default trackFedexShipping;
