import * as Sentry from '@sentry/nextjs';

import { carrierMessages } from '@/constants';
import { CarrierTypes } from '@/types/carrier';

const { AUTH_FAILED } = carrierMessages;

const BASE_URL = 'https://apis-sandbox.fedex.com';

const cancelFedexShipping = async (params: CarrierTypes.ICancelShippingParams) => {
  const { accountNumber, credentials, trackingNumber } = params;

  const authRes = await fetch(`${BASE_URL}/oauth/token`, {
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

    const error = new Error(`${AUTH_FAILED}: HTTP ${authRes.status} - ${responseText}`);

    Sentry.captureException(error, {
      extra: {
        responseStatus: authRes.status,
        responseBody: responseText,
        endpoint: `${BASE_URL}/oauth/token`,
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

  const cancelRes = await fetch(`${BASE_URL}/ship/v1/shipments/cancel`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${authData.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!cancelRes.ok) {
    const responseText = await cancelRes.text();

    const error = new Error(`FedEx shipment cancellation failed: HTTP ${cancelRes.status} - ${responseText}`);

    Sentry.captureException(error, {
      extra: {
        responseStatus: cancelRes.status,
        responseBody: responseText,
        endpoint: `${BASE_URL}/ship/v1/shipments/cancel`,
        trackingNumber,
      },
    });

    throw error;
  }

  return cancelRes.json();
};

export default cancelFedexShipping;
