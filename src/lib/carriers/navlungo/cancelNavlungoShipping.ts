import * as Sentry from '@sentry/nextjs';

import { carrierBaseUrl, carrierMessages } from '@/constants';
import { CarrierTypes } from '@/types/carrier';

const { AUTH_FAILED } = carrierMessages;

const cancelNavlungoShipping = async (params: CarrierTypes.ICancelShippingParams & { carrierShipmentId?: string }) => {
  const { accountNumber, credentials, trackingNumber, carrierShipmentId } = params;

  if (!carrierShipmentId) {
    throw new Error('Navlungo iptal işlemi başarısız: Bu gönderiye ait carrierShipmentId (Guid) bulunamadı.');
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
    let errorData: unknown;

    try {
      errorData = responseText ? JSON.parse(responseText) : null;
    } catch {
      errorData = responseText;
    }

    let errorMessage: string = authRes.statusText || AUTH_FAILED;

    if (typeof errorData === 'string' && errorData.trim()) {
      errorMessage = errorData;
    } else if (errorData && typeof errorData === 'object') {
      const data = errorData as {
        errors?: Array<{ code?: string; message?: string }>;
        message?: string;
        error?: string;
      };

      if (data.errors?.length) {
        errorMessage =
          data.errors
            .map(error => error.message || error.code)
            .filter(Boolean)
            .join(' ') || errorMessage;
      } else if (data.message) {
        errorMessage = data.message;
      } else if (data.error) {
        errorMessage = data.error;
      }
    }

    const error = new Error(errorMessage);

    Sentry.captureException(error, {
      extra: {
        responseStatus: authRes.status,
        responseBody: errorData,
        endpoint: `${carrierBaseUrl.NAVLUNGO}/v1/oauth/token`,
      },
    });

    throw error;
  }

  const authData = await authRes.json();
  const accessToken = authData.access_token;
  const cancelRes = await fetch(`${carrierBaseUrl.NAVLUNGO}/api/shipments/v1/${carrierShipmentId}/void`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  if (!cancelRes.ok) {
    const responseText = await cancelRes.text();
    let errorData: unknown;

    try {
      errorData = responseText ? JSON.parse(responseText) : null;
    } catch {
      errorData = responseText;
    }

    let errorMessage: string = cancelRes.statusText || 'Navlungo shipment cancellation failed';

    if (typeof errorData === 'string' && errorData.trim()) {
      errorMessage = errorData;
    } else if (errorData && typeof errorData === 'object') {
      const data = errorData as {
        errors?: Array<{ code?: string; message?: string }>;
        message?: string;
        error?: string;
        code?: string;
      };

      if (data.errors?.length) {
        errorMessage =
          data.errors
            .map(error => error.message || error.code)
            .filter(Boolean)
            .join(' ') || errorMessage;
      } else if (data.message) {
        errorMessage = data.message;
      } else if (data.error) {
        errorMessage = data.error;
      } else if (data.code) {
        errorMessage = data.code;
      }
    }

    const error = new Error(errorMessage);

    Sentry.captureException(error, {
      extra: {
        responseStatus: cancelRes.status,
        responseBody: errorData,
        endpoint: `${carrierBaseUrl.NAVLUNGO}/api/shipments/v1/${carrierShipmentId}`,
        trackingNumber,
        carrierShipmentId,
      },
    });

    throw error;
  }
  return { status: 'SUCCESS' };
};

export default cancelNavlungoShipping;
