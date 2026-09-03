import * as Sentry from '@sentry/nextjs';

const DOCUMENT_BASE_URL = 'https://documentapitest.prod.fedex.com/sandbox';

type UploadFedexDocumentParams = {
  accessToken: string;
  trackingNumber: string;
  shipmentDate: string;
  originCountryCode: string;
  destinationCountryCode: string;
  document: Buffer;
};

const uploadFedexDocument = async ({
  accessToken,
  trackingNumber,
  shipmentDate,
  originCountryCode,
  destinationCountryCode,
  document,
}: UploadFedexDocumentParams): Promise<void> => {
  if (!Buffer.isBuffer(document) || !document.length) {
    const error = new Error(!Buffer.isBuffer(document) ? 'FedEx ek belgesi Buffer formatında değil.' : 'FedEx ek belgesi boş.');

    Sentry.captureException(error, {
      tags: {
        carrier: 'FEDEX',
        operation: 'ETD_DOCUMENT_UPLOAD',
        errorType: 'VALIDATION',
      },
      extra: {
        trackingNumber,
        shipmentDate,
        originCountryCode,
        destinationCountryCode,
      },
    });

    throw error;
  }

  const fileName = `additional-document-${trackingNumber}.pdf`;
  const shipmentTimestamp = `${shipmentDate}T00:00:00`;
  const endpoint = `${DOCUMENT_BASE_URL}/documents/v1/etds/upload`;

  const documentMetadata = {
    workflowName: 'ETDPostshipment',
    carrierCode: 'FDXE',
    name: fileName,
    contentType: 'application/pdf',
    meta: {
      shipDocumentType: 'OTHER',
      trackingNumber,
      shipmentDate: shipmentTimestamp,
      originCountryCode,
      destinationCountryCode,
    },
  };

  const formData = new FormData();

  formData.append('document', JSON.stringify(documentMetadata));

  formData.append(
    'attachment',
    new Blob([new Uint8Array(document)], {
      type: 'application/pdf',
    }),
    fileName,
  );

  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        carrier: 'FEDEX',
        operation: 'ETD_DOCUMENT_UPLOAD',
        errorType: 'NETWORK',
      },
      extra: {
        endpoint,
        trackingNumber,
        shipmentDate: shipmentTimestamp,
        originCountryCode,
        destinationCountryCode,
        fileName,
        documentSizeBytes: document.length,
      },
    });

    throw error;
  }

  if (!response.ok) {
    const responseText = await response.text();

    const error = new Error(`FedEx ek belge yüklenemedi: HTTP ${response.status} ${response.statusText} - ${responseText}`);

    Sentry.captureException(error, {
      tags: {
        carrier: 'FEDEX',
        operation: 'ETD_DOCUMENT_UPLOAD',
        errorType: 'API',
      },
      extra: {
        endpoint,
        trackingNumber,
        shipmentDate: shipmentTimestamp,
        originCountryCode,
        destinationCountryCode,
        fileName,
        documentSizeBytes: document.length,
        responseStatus: response.status,
        responseStatusText: response.statusText,
        responseBody: responseText,
      },
    });

    throw error;
  }
};

export default uploadFedexDocument;
