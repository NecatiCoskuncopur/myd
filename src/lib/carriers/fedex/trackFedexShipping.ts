import * as Sentry from '@sentry/nextjs';

import { carrierBaseUrl, carrierMessages } from '@/constants';
import getSystemParam from '@/lib/getSystemParam';

const { AUTH_FAILED } = carrierMessages;

const trackFedexShipping = async (trackingNumber: string) => {
  const [apiKey, secretKey] = await Promise.all([getSystemParam('FEDEX_TRACKING_API_KEY'), getSystemParam('FEDEX_TRACKING_SECRET_KEY')]);

  if (!apiKey || !secretKey) {
    throw new Error('FedEx tracking sistem parametreleri eksik.');
  }

  const authRes = await fetch(`${carrierBaseUrl.FEDEX}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: apiKey,
      client_secret: secretKey,
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
        endpoint: `${carrierBaseUrl.FEDEX}/oauth/token`,
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

  const trackingRes = await fetch(`${carrierBaseUrl.FEDEX}/track/v1/trackingnumbers`, {
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
        endpoint: `${carrierBaseUrl.FEDEX}/track/v1/trackingnumbers`,
        trackingNumber,
      },
    });

    throw error;
  }

  const trackingData = await trackingRes.json();

  return trackingData?.output?.completeTrackResults?.[0]?.trackResults?.[0]?.latestStatusDetail?.statusByLocale;
};

export default trackFedexShipping;
