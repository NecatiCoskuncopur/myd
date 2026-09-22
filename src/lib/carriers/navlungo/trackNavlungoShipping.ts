import * as Sentry from '@sentry/nextjs';

import { carrierBaseUrl, carrierMessages } from '@/constants';
import { CarrierTypes } from '@/types/carrier';

const { AUTH_FAILED } = carrierMessages;

const trackNavlungoShipping = async (params: CarrierTypes.ITrackingParams) => {
  const { accountNumber, credentials, trackingNumber } = params;

  if (!trackingNumber) {
    throw new Error('Navlungo takip işlemi başarısız: Takip numarası bulunamadı.');
  }

  const authRes = await fetch(`${carrierBaseUrl.NAVLUNGO}/v1/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      refresh_token: accountNumber,
    }),
  });

  if (!authRes.ok) {
    const responseText = await authRes.text();
    const error = new Error(`${AUTH_FAILED}: ${responseText}`);
    Sentry.captureException(error, { extra: { endpoint: `${carrierBaseUrl.NAVLUNGO}/v1/oauth/token`, responseStatus: authRes.status } });
    throw error;
  }

  const authData = await authRes.json();
  const accessToken = authData.access_token;

  const trackingRes = await fetch(`${carrierBaseUrl.NAVLUNGO}/api/shipments/v1/${trackingNumber}/tracking`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!trackingRes.ok) {
    const responseText = await trackingRes.text();
    const error = new Error(`Navlungo takip bilgisi alınamadı: ${responseText}`);

    Sentry.captureException(error, {
      extra: {
        responseStatus: trackingRes.status,
        responseBody: responseText,
        endpoint: `${carrierBaseUrl.NAVLUNGO}/api/shipments/v1/${trackingNumber}/tracking`,
        trackingNumber,
      },
    });

    throw error;
  }

  return trackingRes.json();
};

export default trackNavlungoShipping;
