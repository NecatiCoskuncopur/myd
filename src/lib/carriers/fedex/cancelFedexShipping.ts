import * as Sentry from '@sentry/nextjs';

import { carrierBaseUrl, carrierMessages } from '@/constants';
import { CarrierTypes } from '@/types/carrier';

const { AUTH_FAILED } = carrierMessages;

const cancelFedexShipping = async (params: CarrierTypes.ICancelShippingParams) => {
  const { accountNumber, credentials, trackingNumber } = params;

  const authRes = await fetch(`${carrierBaseUrl.FEDEX}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: credentials.apiKey,
      client_secret: credentials.secretKey,
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
        errors?: Array<{
          code?: string;
          message?: string;
        }>;
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
        endpoint: `${carrierBaseUrl.FEDEX}/oauth/token`,
      },
    });

    throw error;
  }

  const authData = await authRes.json();

  const payload = {
    accountNumber: {
      value: accountNumber,
    },
    senderCountryCode: 'TR',
    deletionControl: 'DELETE_ALL_PACKAGES',
    trackingNumber,
  };

  const cancelRes = await fetch(`${carrierBaseUrl.FEDEX}/ship/v1/shipments/cancel`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${authData.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!cancelRes.ok) {
    const responseText = await cancelRes.text();

    let errorData: unknown;

    try {
      errorData = responseText ? JSON.parse(responseText) : null;
    } catch {
      errorData = responseText;
    }

    let errorMessage: string = cancelRes.statusText || 'FedEx shipment cancellation failed';

    if (typeof errorData === 'string' && errorData.trim()) {
      errorMessage = errorData;
    } else if (errorData && typeof errorData === 'object') {
      const data = errorData as {
        errors?: Array<{
          code?: string;
          message?: string;
        }>;
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
        responseStatus: cancelRes.status,
        responseBody: errorData,
        endpoint: `${carrierBaseUrl.FEDEX}/ship/v1/shipments/cancel`,
        trackingNumber,
      },
    });

    throw error;
  }

  return cancelRes.json();
};

export default cancelFedexShipping;
