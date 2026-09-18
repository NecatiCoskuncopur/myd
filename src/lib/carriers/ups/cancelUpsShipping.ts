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

    let errorData: unknown;

    try {
      errorData = responseText ? JSON.parse(responseText) : null;
    } catch {
      errorData = responseText;
    }

    let errorMessage: string = authRes.statusText || 'UPS authentication failed';

    if (typeof errorData === 'string' && errorData.trim()) {
      errorMessage = errorData;
    } else if (errorData && typeof errorData === 'object') {
      const data = errorData as {
        response?: {
          errors?: Array<{
            code?: string;
            message?: string;
          }>;
        };
        errors?: Array<{
          code?: string;
          message?: string;
        }>;
        message?: string;
        error?: string;
      };

      const errors = data.response?.errors || data.errors;

      if (errors?.length) {
        errorMessage =
          errors
            .map(error => error.message || error.code)
            .filter(Boolean)
            .join(' ') || errorMessage;
      } else if (data.message) {
        errorMessage = data.message;
      } else if (data.error) {
        errorMessage = data.error;
      }
    }

    throw new Error(errorMessage);
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

    let errorData: unknown;

    try {
      errorData = responseText ? JSON.parse(responseText) : null;
    } catch {
      errorData = responseText;
    }

    let errorMessage: string = response.statusText || 'UPS shipment cancellation failed';

    if (typeof errorData === 'string' && errorData.trim()) {
      errorMessage = errorData;
    } else if (errorData && typeof errorData === 'object') {
      const data = errorData as {
        response?: {
          errors?: Array<{
            code?: string;
            message?: string;
          }>;
        };
        errors?: Array<{
          code?: string;
          message?: string;
        }>;
        message?: string;
        error?: string;
      };

      const errors = data.response?.errors || data.errors;

      if (errors?.length) {
        errorMessage =
          errors
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
        carrier: 'UPS',
        responseStatus: response.status,
        responseBody: errorData,
        endpoint: `${carrierBaseUrl.UPS}/api/shipments/v2409/void/cancel/${trackingNumber}`,
        trackingNumber,
      },
    });

    throw error;
  }

  return response.json();
};

export default cancelUpsShipping;
