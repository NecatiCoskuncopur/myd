import * as Sentry from '@sentry/nextjs';

import { carrierBaseUrl } from '@/constants';
import { CarrierTypes } from '@/types/carrier';

interface IUpsAuthResponse {
  access_token: string;
  token_type?: string;
  expires_in?: string;
  status?: string;
}

interface IUpsActivity {
  status?: {
    type?: string;
    description?: string;
    code?: string;
  };
}

interface IUpsPackage {
  currentStatus?: {
    simplifiedTextDescription?: string;
    description?: string;
    code?: string;
  };
  activity?: IUpsActivity[];
}

interface IUpsShipment {
  package?: IUpsPackage[];
  warnings?: Array<{ code?: string; message?: string }>;
}

interface IUpsTrackResponse {
  trackResponse?: {
    shipment?: IUpsShipment[];
  };
  response?: {
    errors?: Array<{ code?: string; message?: string }>;
  };
}

let cachedUpsToken: { token: string; expiresAt: number } | null = null;

const getUpsBaseUrl = (): string => {
  const url = carrierBaseUrl.UPS || 'https://onlinetools.ups.com';
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

const getUpsToken = async (credentials: CarrierTypes.ITrackingParams['credentials']): Promise<string | null> => {
  const now = Date.now();
  if (cachedUpsToken && cachedUpsToken.expiresAt > now) {
    return cachedUpsToken.token;
  }

  const clientId = credentials?.clientId || '';
  const clientSecret = credentials?.clientSecret || '';

  if (!clientId || !clientSecret) {
    return null;
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const baseUrl = getUpsBaseUrl();
  const oauthEndpoint = `${baseUrl}/security/v1/oauth/token`;

  const authRes = await fetch(oauthEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basicAuth}`,
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
    }),
  });

  if (!authRes.ok) {
    const responseText = await authRes.text();
    Sentry.captureException(new Error(`UPS auth failed: HTTP ${authRes.status} - ${responseText}`), {
      extra: {
        carrier: 'UPS',
        operation: 'TRACK_SHIPMENT_AUTH',
        responseStatus: authRes.status,
        responseBody: responseText,
        endpoint: oauthEndpoint,
      },
    });
    return null;
  }

  const authData = (await authRes.json()) as IUpsAuthResponse;
  const token = authData.access_token;
  const expiresInSeconds = Number(authData.expires_in) || 14400;

  cachedUpsToken = {
    token,
    expiresAt: now + (expiresInSeconds - 300) * 1000,
  };

  return token;
};

const trackUpsShipping = async (params: CarrierTypes.ITrackingParams): Promise<string> => {
  const { credentials, trackingNumber } = params;

  if (!trackingNumber) {
    return '';
  }

  try {
    const accessToken = await getUpsToken(credentials);

    if (!accessToken) {
      return '';
    }

    const baseUrl = getUpsBaseUrl();
    const query = new URLSearchParams({
      locale: 'en_US',
      returnSignature: 'false',
      returnMilestones: 'false',
      returnPOD: 'false',
    }).toString();

    const endpoint = `${baseUrl}/api/track/v1/details/${encodeURIComponent(trackingNumber)}?${query}`;

    const trackingRes = await fetch(endpoint, {
      method: 'GET',
      headers: {
        transId: crypto.randomUUID(),
        transactionSrc: 'production',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!trackingRes.ok) {
      const responseText = await trackingRes.text();

      // Takip numarası henüz aktif değilse veya bulunamadıysa (404) cron akışını bozmadan geç
      if (trackingRes.status === 404) {
        return '';
      }

      Sentry.captureException(new Error(`UPS tracking failed: HTTP ${trackingRes.status} - ${responseText}`), {
        extra: {
          carrier: 'UPS',
          operation: 'TRACK_SHIPMENT',
          responseStatus: trackingRes.status,
          responseBody: responseText,
          endpoint,
          trackingNumber,
        },
      });

      return '';
    }

    const trackingData = (await trackingRes.json()) as IUpsTrackResponse;
    const pkg = trackingData?.trackResponse?.shipment?.[0]?.package?.[0];

    const status = pkg?.currentStatus?.simplifiedTextDescription || pkg?.currentStatus?.description || pkg?.activity?.[0]?.status?.description || '';

    return status;
  } catch {
    return '';
  }
};

export default trackUpsShipping;
