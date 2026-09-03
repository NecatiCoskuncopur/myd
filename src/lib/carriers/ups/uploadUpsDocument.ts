import * as Sentry from '@sentry/nextjs';
import moment from 'moment';

const DOCUMENT_BASE_URL = 'https://wwwcie.ups.com/api';

type UploadUpsDocumentParams = {
  accessToken: string;
  accountNumber: string;
  shipmentIdentifier: string;
  trackingNumbers: string[];
  document: Buffer;
};

const uploadUpsDocument = async ({ accessToken, accountNumber, shipmentIdentifier, trackingNumbers, document }: UploadUpsDocumentParams): Promise<void> => {
  if (!Buffer.isBuffer(document) || !document.length) {
    const error = new Error(!Buffer.isBuffer(document) ? 'UPS ek belgesi Buffer formatında değil.' : 'UPS ek belgesi boş.');

    Sentry.captureException(error, {
      tags: {
        carrier: 'UPS',
        operation: 'PAPERLESS_DOCUMENT_UPLOAD',
        errorType: 'VALIDATION',
      },
      extra: {
        accountNumber,
        shipmentIdentifier,
        trackingNumbers,
      },
    });

    throw error;
  }

  if (!trackingNumbers.length) {
    const error = new Error('UPS ek belge yükleme için tracking number bulunamadı.');

    Sentry.captureException(error, {
      tags: {
        carrier: 'UPS',
        operation: 'PAPERLESS_DOCUMENT_UPLOAD',
        errorType: 'VALIDATION',
      },
      extra: {
        accountNumber,
        shipmentIdentifier,
      },
    });

    throw error;
  }

  const fileName = `additional-document-${shipmentIdentifier}.pdf`;

  const transId = crypto.randomUUID().replaceAll('-', '').slice(0, 32);

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
    ShipperNumber: accountNumber,
    transId,
    transactionSrc: 'testing',
  };

  /*
   * 1. Belgeyi UPS Forms History'ye yükle.
   */
  const uploadPayload = {
    UploadRequest: {
      Request: {
        TransactionReference: {
          CustomerContext: shipmentIdentifier,
        },
      },
      ShipperNumber: accountNumber,
      UserCreatedForm: [
        {
          UserCreatedFormFileName: fileName,
          UserCreatedFormFileFormat: 'pdf',
          UserCreatedFormDocumentType: '008',
          UserCreatedFormFile: document.toString('base64'),
        },
      ],
    },
  };

  let uploadResponse: Response;

  try {
    uploadResponse = await fetch(`${DOCUMENT_BASE_URL}/paperlessdocuments/v2/upload`, {
      method: 'POST',
      headers,
      body: JSON.stringify(uploadPayload),
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        carrier: 'UPS',
        operation: 'PAPERLESS_DOCUMENT_UPLOAD',
        errorType: 'NETWORK',
      },
      extra: {
        accountNumber,
        shipmentIdentifier,
        trackingNumbers,
        fileName,
        documentSizeBytes: document.length,
      },
    });

    throw error;
  }

  const uploadResponseText = await uploadResponse.text();

  if (!uploadResponse.ok) {
    const error = new Error(`UPS ek belge yüklenemedi: HTTP ${uploadResponse.status} ${uploadResponse.statusText} - ${uploadResponseText}`);

    Sentry.captureException(error, {
      tags: {
        carrier: 'UPS',
        operation: 'PAPERLESS_DOCUMENT_UPLOAD',
        errorType: 'API',
      },
      extra: {
        accountNumber,
        shipmentIdentifier,
        trackingNumbers,
        fileName,
        documentSizeBytes: document.length,
        responseStatus: uploadResponse.status,
        responseStatusText: uploadResponse.statusText,
        responseBody: uploadResponseText,
      },
    });

    throw error;
  }

  let uploadData;

  try {
    uploadData = JSON.parse(uploadResponseText);
  } catch {
    const error = new Error('UPS Paperless Document upload cevabı JSON formatında değil.');

    Sentry.captureException(error, {
      tags: {
        carrier: 'UPS',
        operation: 'PAPERLESS_DOCUMENT_UPLOAD',
        errorType: 'API_RESPONSE',
      },
      extra: {
        accountNumber,
        shipmentIdentifier,
        responseBody: uploadResponseText,
      },
    });

    throw error;
  }

  const uploadStatus = uploadData?.UploadResponse?.Response?.ResponseStatus?.Code;

  const documentIds: string[] = uploadData?.UploadResponse?.FormsHistoryDocumentID?.DocumentID ?? [];

  if (uploadStatus !== '1' || !documentIds.length) {
    const error = new Error('UPS Paperless Document upload başarılı ancak DocumentID alınamadı.');

    Sentry.captureException(error, {
      tags: {
        carrier: 'UPS',
        operation: 'PAPERLESS_DOCUMENT_UPLOAD',
        errorType: 'API_RESPONSE',
      },
      extra: {
        accountNumber,
        shipmentIdentifier,
        trackingNumbers,
        responseBody: uploadData,
      },
    });

    throw error;
  }

  /*
   * 2. Yüklenen belgeyi shipment'a bağla.
   */
  const shipmentDateAndTime = moment().format('YYYY-MM-DD-HH.mm.ss');

  const imagePayload = {
    PushToImageRepositoryRequest: {
      Request: {
        TransactionReference: {
          CustomerContext: shipmentIdentifier,
        },
      },
      ShipperNumber: accountNumber,
      FormsHistoryDocumentID: {
        DocumentID: documentIds,
      },
      ShipmentIdentifier: shipmentIdentifier,
      ShipmentDateAndTime: shipmentDateAndTime,
      ShipmentType: '1',
      TrackingNumber: trackingNumbers,
    },
  };

  let imageResponse: Response;

  try {
    imageResponse = await fetch(`${DOCUMENT_BASE_URL}/paperlessdocuments/v2/image`, {
      method: 'POST',
      headers: {
        ...headers,
        transId: crypto.randomUUID().replaceAll('-', '').slice(0, 32),
      },
      body: JSON.stringify(imagePayload),
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        carrier: 'UPS',
        operation: 'PAPERLESS_DOCUMENT_PUSH_IMAGE',
        errorType: 'NETWORK',
      },
      extra: {
        accountNumber,
        shipmentIdentifier,
        trackingNumbers,
        documentIds,
        shipmentDateAndTime,
      },
    });

    throw error;
  }

  const imageResponseText = await imageResponse.text();

  if (!imageResponse.ok) {
    const error = new Error(`UPS ek belge shipment'a bağlanamadı: HTTP ${imageResponse.status} ${imageResponse.statusText} - ${imageResponseText}`);

    Sentry.captureException(error, {
      tags: {
        carrier: 'UPS',
        operation: 'PAPERLESS_DOCUMENT_PUSH_IMAGE',
        errorType: 'API',
      },
      extra: {
        accountNumber,
        shipmentIdentifier,
        trackingNumbers,
        documentIds,
        shipmentDateAndTime,
        responseStatus: imageResponse.status,
        responseStatusText: imageResponse.statusText,
        responseBody: imageResponseText,
      },
    });

    throw error;
  }

  let imageData;

  try {
    imageData = JSON.parse(imageResponseText);
  } catch {
    const error = new Error('UPS Paperless Document image cevabı JSON formatında değil.');

    Sentry.captureException(error, {
      tags: {
        carrier: 'UPS',
        operation: 'PAPERLESS_DOCUMENT_PUSH_IMAGE',
        errorType: 'API_RESPONSE',
      },
      extra: {
        accountNumber,
        shipmentIdentifier,
        trackingNumbers,
        documentIds,
        responseBody: imageResponseText,
      },
    });

    throw error;
  }

  const imageStatus = imageData?.PushToImageRepositoryResponse?.Response?.ResponseStatus?.Code;

  if (imageStatus !== '1') {
    const error = new Error('UPS ek belge shipment bağlantısı başarısız.');

    Sentry.captureException(error, {
      tags: {
        carrier: 'UPS',
        operation: 'PAPERLESS_DOCUMENT_PUSH_IMAGE',
        errorType: 'API_RESPONSE',
      },
      extra: {
        accountNumber,
        shipmentIdentifier,
        trackingNumbers,
        documentIds,
        shipmentDateAndTime,
        responseBody: imageData,
      },
    });

    throw error;
  }
};

export default uploadUpsDocument;
