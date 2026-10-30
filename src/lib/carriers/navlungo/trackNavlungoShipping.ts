import * as Sentry from '@sentry/nextjs';

import { carrierBaseUrl, carrierMessages } from '@/constants';
import { CarrierTypes } from '@/types/carrier';

const { AUTH_FAILED } = carrierMessages;

interface INavlungoAuthResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
}

interface INavlungoTrackingResponse {
  status?: string;
  state?: string;
  data?: {
    status?: string;
    state?: string;
  };
  [key: string]: unknown;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

const getNavlungoToken = async (credentials: CarrierTypes.ITrackingParams['credentials'], accountNumber?: string): Promise<string> => {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now) {
    return cachedToken.token;
  }

  const clientId = credentials?.clientId || '';
  const clientSecret = credentials?.clientSecret || '';
  const refreshToken = accountNumber || '';

  const authRes = await fetch(`${carrierBaseUrl.NAVLUNGO}/v1/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }),
  });

  if (!authRes.ok) {
    const responseText = await authRes.text();
    const error = new Error(`${AUTH_FAILED}: ${responseText}`);
    Sentry.captureException(error, {
      extra: {
        endpoint: `${carrierBaseUrl.NAVLUNGO}/v1/oauth/token`,
        responseStatus: authRes.status,
      },
    });
    throw error;
  }

  const authData = (await authRes.json()) as INavlungoAuthResponse;
  const token = authData.access_token;
  const expiresIn = (authData.expires_in || 3600) - 300;

  cachedToken = {
    token,
    expiresAt: now + expiresIn * 1000,
  };

  return token;
};

const trackNavlungoShipping = async (params: CarrierTypes.ITrackingParams): Promise<string> => {
  const { accountNumber, credentials, trackingNumber } = params;

  if (!trackingNumber) {
    return '';
  }

  try {
    const accessToken = await getNavlungoToken(credentials, accountNumber);

    const trackingRes = await fetch(`${carrierBaseUrl.NAVLUNGO}/api/shipments/v1/${trackingNumber}/tracking`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!trackingRes.ok) {
      const responseText = await trackingRes.text();

      if (responseText.includes('shipmentnotfound.error') || trackingRes.status === 404) {
        return '';
      }

      if (responseText.includes('too.many.requests') || trackingRes.status === 429) {
        Sentry.captureMessage('Navlungo Rate Limit aşıldı (too.many.requests)', {
          level: 'warning',
          extra: { trackingNumber },
        });
        return '';
      }

      const error = new Error(`Navlungo takip bilgisi alınamadı: ${responseText}`);
      Sentry.captureException(error, {
        extra: {
          responseStatus: trackingRes.status,
          responseBody: responseText,
          endpoint: `${carrierBaseUrl.NAVLUNGO}/api/shipments/v1/${trackingNumber}/tracking`,
          trackingNumber,
        },
      });

      return '';
    }

    const trackingData = (await trackingRes.json()) as INavlungoTrackingResponse;
    const status = trackingData?.status || trackingData?.data?.status || trackingData?.state || '';

    return typeof status === 'string' ? status : '';
  } catch {
    return '';
  }
};

export default trackNavlungoShipping;
