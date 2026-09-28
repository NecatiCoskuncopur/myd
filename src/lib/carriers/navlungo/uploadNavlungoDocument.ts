import * as Sentry from '@sentry/nextjs';

import { AdditionalDocumentContentTypeEnum, carrierBaseUrl } from '@/constants';

type UploadNavlungoDocumentParams = {
  accessToken: string;
  shipmentId: string;
  document: Buffer;
  contentType: AdditionalDocumentContentTypeEnum;
  fileName: string;
  documentType: string;
  eArchiveInfo?: {
    date: string;
    number: string;
  };
};

const uploadNavlungoDocument = async ({
  accessToken,
  shipmentId,
  document,
  contentType,
  fileName,
  documentType,
  eArchiveInfo,
}: UploadNavlungoDocumentParams): Promise<void> => {
  if (!Buffer.isBuffer(document) || !document.length) {
    const error = new Error(!Buffer.isBuffer(document) ? 'Navlungo ek belgesi Buffer formatında değil.' : 'Navlungo ek belgesi boş.');

    Sentry.captureException(error, {
      tags: {
        carrier: 'NAVLUNGO',
        operation: 'DOCUMENT_UPLOAD',
        errorType: 'VALIDATION',
      },
      extra: { shipmentId, fileName, documentType },
    });

    throw error;
  }

  const endpoint = `${carrierBaseUrl.NAVLUNGO}/api/shipments/v1/${shipmentId}/documents`;
  const requestBody = {
    ShipmentDocuments: [
      {
        FileName: fileName,
        Type: documentType,
        ...(documentType === 'e-archive' && eArchiveInfo && { EArchiveInfo: eArchiveInfo }),
      },
    ],
  };

  const initResponse = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!initResponse.ok) {
    const responseText = await initResponse.text();
    const error = new Error(`Navlungo belge yükleme başlatılamadı: ${responseText}`);

    Sentry.captureException(error, {
      tags: {
        carrier: 'NAVLUNGO',
        operation: 'DOCUMENT_UPLOAD_INIT',
        errorType: 'API',
      },
      extra: { shipmentId, responseStatus: initResponse.status, responseBody: responseText },
    });

    throw error;
  }

  const responseData = await initResponse.json();
  const uploadUrl = responseData?.documents?.[0]?.urlInfo?.uploadUrl;

  if (!uploadUrl) {
    const error = new Error(`Navlungo dosya yükleme için S3 Presigned URL dönmedi. Gelen Yanıt: ${JSON.stringify(responseData)}`);

    Sentry.captureException(error, {
      tags: {
        carrier: 'NAVLUNGO',
        operation: 'DOCUMENT_UPLOAD_INIT',
        errorType: 'API_RESPONSE',
      },
      extra: { shipmentId, responseData },
    });

    throw error;
  }
  const s3Response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
    body: new Uint8Array(document),
  });

  if (!s3Response.ok) {
    const error = new Error(`AWS S3'e dosya yükleme başarısız oldu (HTTP ${s3Response.status})`);

    Sentry.captureException(error, {
      tags: {
        carrier: 'NAVLUNGO',
        operation: 'S3_UPLOAD',
        errorType: 'API',
      },
      extra: { shipmentId, fileName, uploadUrl, responseStatus: s3Response.status },
    });

    throw error;
  }
};

export default uploadNavlungoDocument;
