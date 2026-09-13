import * as Sentry from '@sentry/nextjs';
import moment from 'moment';

import { AdditionalDocumentContentTypeEnum, AdditionalDocumentEnum, carrierBaseUrl } from '@/constants';

type UploadUpsDocumentParams = {
  accessToken: string;
  accountNumber: string;
  shipmentIdentifier: string;
  trackingNumbers: string[];
  document: Buffer;
  type: AdditionalDocumentEnum;
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

const getUpsDocumentType = (type: AdditionalDocumentEnum) => {
  switch (type) {
    case AdditionalDocumentEnum.COMMERCIAL_INVOICE:
      return '002';

    case AdditionalDocumentEnum.CERTIFICATE_OF_ORIGIN:
      return '003';

    case AdditionalDocumentEnum.OTHER:
      return '008';

    default: {
      const exhaustiveCheck: never = type;

      return exhaustiveCheck;
    }
  }
};

const uploadUpsDocument = async ({
  accessToken,
  accountNumber,
  shipmentIdentifier,
  trackingNumbers,
  document,
  type,
  contentType,
}: UploadUpsDocumentParams): Promise<void> => {
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
        type,
        contentType,
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
        type,
        contentType,
      },
    });

    throw error;
  }

  const fileExtension = getFileExtension(contentType);

  const upsDocumentType = getUpsDocumentType(type);

  const fileName = `additional-document-${shipmentIdentifier}-${type.toLowerCase()}.${fileExtension}`;

  const transId = crypto.randomUUID().replaceAll('-', '').slice(0, 32);

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
    ShipperNumber: accountNumber,
    transId,
    transactionSrc: 'testing',
  };

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
          UserCreatedFormFileFormat: fileExtension,
          UserCreatedFormDocumentType: upsDocumentType,
          UserCreatedFormFile: document.toString('base64'),
        },
      ],
    },
  };

  let uploadResponse: Response;
  console.log('[UPS PAPERLESS] Upload başlıyor', {
    shipmentIdentifier,
    trackingNumbers,
    type,
    upsDocumentType,
    contentType,
    fileName,
    documentSizeBytes: document.length,
  });
  try {
    uploadResponse = await fetch(`${carrierBaseUrl.UPS}/api/paperlessdocuments/v2/upload`, {
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
        type,
        upsDocumentType,
        contentType,
        fileName,
        documentSizeBytes: document.length,
      },
    });

    throw error;
  }

  const uploadResponseText = await uploadResponse.text();

  console.log('[UPS PAPERLESS] Upload response', {
    shipmentIdentifier,
    type,
    upsDocumentType,
    status: uploadResponse.status,
    statusText: uploadResponse.statusText,
    ok: uploadResponse.ok,
    body: uploadResponseText,
  });

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
        type,
        upsDocumentType,
        contentType,
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
        trackingNumbers,
        type,
        upsDocumentType,
        contentType,
        responseBody: uploadResponseText,
      },
    });

    throw error;
  }

  const uploadStatus = uploadData?.UploadResponse?.Response?.ResponseStatus?.Code;

  const documentIds: string[] = uploadData?.UploadResponse?.FormsHistoryDocumentID?.DocumentID ?? [];

  console.log('[UPS PAPERLESS] DocumentID alındı', {
    shipmentIdentifier,
    type,
    upsDocumentType,
    documentIds,
  });

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
        type,
        upsDocumentType,
        contentType,
        responseBody: uploadData,
      },
    });

    throw error;
  }

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
    imageResponse = await fetch(`${carrierBaseUrl.UPS}/api/paperlessdocuments/v2/image`, {
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
        type,
        upsDocumentType,
        contentType,
        shipmentDateAndTime,
      },
    });

    throw error;
  }

  const imageResponseText = await imageResponse.text();
  console.log('[UPS PAPERLESS] Image response', {
    shipmentIdentifier,
    type,
    upsDocumentType,
    status: imageResponse.status,
    statusText: imageResponse.statusText,
    ok: imageResponse.ok,
    body: imageResponseText,
  });

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
        type,
        upsDocumentType,
        contentType,
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
        type,
        upsDocumentType,
        contentType,
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
        type,
        upsDocumentType,
        contentType,
        shipmentDateAndTime,
        responseBody: imageData,
      },
    });

    throw error;
  }
};

export default uploadUpsDocument;
