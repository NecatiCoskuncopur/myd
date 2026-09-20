import * as Sentry from '@sentry/nextjs';

import { AdditionalDocumentContentTypeEnum, carrierBaseUrl } from '@/constants';

type UploadFedexDocumentParams = {
  accessToken: string;
  trackingNumber: string;
  shipmentDate: string;
  originCountryCode: string;
  destinationCountryCode: string;
  document: Buffer;
  contentType: AdditionalDocumentContentTypeEnum;
};

const getFileExtension = (contentType: AdditionalDocumentContentTypeEnum) => {
  switch (contentType) {
    case AdditionalDocumentContentTypeEnum.PDF:
      return 'pdf';

    case AdditionalDocumentContentTypeEnum.JPEG:
      return 'jpg';

    case AdditionalDocumentContentTypeEnum.PNG:
      return 'png';

    default: {
      const exhaustiveCheck: never = contentType;

      return exhaustiveCheck;
    }
  }
};

const uploadFedexDocument = async ({
  accessToken,
  trackingNumber,
  shipmentDate,
  originCountryCode,
  destinationCountryCode,
  document,
  contentType,
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
        contentType,
      },
    });

    throw error;
  }

  const extension = getFileExtension(contentType);

  const fileName = `additional-document-${trackingNumber}.${extension}`;

  const shipmentTimestamp = `${shipmentDate}T00:00:00`;

  const endpoint = `${carrierBaseUrl.FEDEXDOCUMENT}/documents/v1/etds/upload`;

  const documentMetadata = {
    workflowName: 'ETDPostshipment',
    carrierCode: 'FDXE',
    name: fileName,
    contentType,
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
      type: contentType,
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
        documentType: 'OTHER',
        contentType,
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
        documentType: 'OTHER',
        contentType,
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
