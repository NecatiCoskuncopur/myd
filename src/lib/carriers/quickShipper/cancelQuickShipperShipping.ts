import * as Sentry from '@sentry/nextjs';

import { carrierBaseUrl } from '@/constants';
import { CarrierTypes } from '@/types/carrier';

const cancelQuickShipperShipping = async (params: CarrierTypes.ICancelShippingParams) => {
  const { accountNumber, credentials, trackingNumber } = params;

  const endpoint = `${carrierBaseUrl.QUICKSHIPPER}/api/affiliate/shipments/deleteShipment?AWBNumber=${encodeURIComponent(trackingNumber)}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      accountNumber,
      'qs-key': credentials.apiKey,
      'qs-secret': credentials.apiSecret,
    },
  });

  const responseText = await response.text();

  if (!response.ok) {
    let errorData: unknown;

    try {
      errorData = responseText ? JSON.parse(responseText) : null;
    } catch {
      errorData = responseText;
    }

    let errorMessage: string = response.statusText || 'QuickShipper shipment cancellation failed';

    if (typeof errorData === 'string' && errorData.trim()) {
      errorMessage = errorData;
    } else if (errorData && typeof errorData === 'object') {
      const data = errorData as {
        message?: string;
        error?: string;
        errors?: Array<{
          message?: string;
          code?: string;
        }>;
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
        carrier: 'QUICKSHIPPER',
        responseStatus: response.status,
        responseStatusText: response.statusText,
        responseBody: errorData,
        endpoint,
        trackingNumber,
        accountNumber,
      },
    });

    throw error;
  }

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
  }
};

export default cancelQuickShipperShipping;
