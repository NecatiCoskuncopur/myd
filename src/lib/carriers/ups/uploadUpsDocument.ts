import * as Sentry from '@sentry/nextjs';
import moment from 'moment';

import { AdditionalDocumentContentTypeEnum, carrierBaseUrl } from '@/constants';

type UploadUpsDocumentParams = {
  accessToken: string;
  accountNumber: string;
  shipmentIdentifier: string;
  trackingNumbers: string[];
  document: Buffer;
  contentType: AdditionalDocumentContentTypeEnum;
};

interface IUpsApiErrorItem {
  code?: string;
  message?: string;
}

interface IUpsApiErrorResponse {
  response?: {
    errors?: IUpsApiErrorItem[];
  };
  Fault?: {
    faultstring?: string;
  };
}

interface IUpsUploadResponse {
  UploadResponse?: {
    Response?: {
      ResponseStatus?: {
        Code?: string;
      };
    };
    FormsHistoryDocumentID?: {
      DocumentID?: string | string[];
    };
  };
}

interface IUpsImageResponse {
  PushToImageRepositoryResponse?: {
    Response?: {
      ResponseStatus?: {
        Code?: string;
      };
    };
  };
}

const getFileExtension = (contentType: AdditionalDocumentContentTypeEnum): string => {
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

const uploadUpsDocument = async ({
  accessToken,
  accountNumber,
  shipmentIdentifier,
  trackingNumbers,
  document,
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
        contentType,
      },
    });

    throw error;
  }

  const fileExtension = getFileExtension(contentType);
  const fileName = `additional-document-${shipmentIdentifier}-${crypto.randomUUID()}.${fileExtension}`;
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
          UserCreatedFormDocumentType: '008',
          UserCreatedFormFile: document.toString('base64'),
        },
      ],
    },
  };

  let uploadResponse: Response;

  try {
    uploadResponse = await fetch(`${carrierBaseUrl.UPS}/api/paperlessdocuments/v2/upload`, {
      method: 'POST',
      headers,
      body: JSON.stringify(uploadPayload),
    });
  } catch (error: unknown) {
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
        contentType,
        fileName,
        documentSizeBytes: document.length,
      },
    });

    throw error;
  }

  const uploadResponseText = await uploadResponse.text();

  if (!uploadResponse.ok) {
    let errorMessage = `UPS ek belge yüklenemedi (HTTP ${uploadResponse.status})`;
    let parsedBody: IUpsApiErrorResponse | null = null;

    try {
      parsedBody = JSON.parse(uploadResponseText) as IUpsApiErrorResponse;

      if (parsedBody.response?.errors && Array.isArray(parsedBody.response.errors) && parsedBody.response.errors.length > 0) {
        errorMessage = parsedBody.response.errors
          .map(err => err.message || err.code)
          .filter(Boolean)
          .join(' | ');
      } else if (parsedBody.Fault?.faultstring) {
        errorMessage = parsedBody.Fault.faultstring;
      }
    } catch {
      if (uploadResponseText.trim()) {
        errorMessage = uploadResponseText;
      }
    }

    const error = new Error(errorMessage);

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
        contentType,
        fileName,
        documentSizeBytes: document.length,
        responseStatus: uploadResponse.status,
        responseStatusText: uploadResponse.statusText,
        responseBody: parsedBody ?? uploadResponseText,
      },
    });

    throw error;
  }

  let uploadData: IUpsUploadResponse;

  try {
    uploadData = JSON.parse(uploadResponseText) as IUpsUploadResponse;
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
        contentType,
        responseBody: uploadResponseText,
      },
    });

    throw error;
  }

  const uploadStatus = uploadData?.UploadResponse?.Response?.ResponseStatus?.Code;

  const rawDocumentId = uploadData?.UploadResponse?.FormsHistoryDocumentID?.DocumentID;
  const documentIds: string[] = Array.isArray(rawDocumentId) ? rawDocumentId : rawDocumentId ? [rawDocumentId] : [];

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
  } catch (error: unknown) {
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
        contentType,
        shipmentDateAndTime,
      },
    });

    throw error;
  }

  const imageResponseText = await imageResponse.text();

  if (!imageResponse.ok) {
    let errorMessage = `UPS ek belge shipment'a bağlanamadı (HTTP ${imageResponse.status})`;
    let parsedBody: IUpsApiErrorResponse | null = null;

    try {
      parsedBody = JSON.parse(imageResponseText) as IUpsApiErrorResponse;

      if (parsedBody.response?.errors && Array.isArray(parsedBody.response.errors) && parsedBody.response.errors.length > 0) {
        errorMessage = parsedBody.response.errors
          .map(err => err.message || err.code)
          .filter(Boolean)
          .join(' | ');
      } else if (parsedBody.Fault?.faultstring) {
        errorMessage = parsedBody.Fault.faultstring;
      }
    } catch {
      if (imageResponseText.trim()) {
        errorMessage = imageResponseText;
      }
    }

    const error = new Error(errorMessage);

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
        contentType,
        shipmentDateAndTime,
        responseStatus: imageResponse.status,
        responseStatusText: imageResponse.statusText,
        responseBody: parsedBody ?? imageResponseText,
      },
    });

    throw error;
  }

  let imageData: IUpsImageResponse;

  try {
    imageData = JSON.parse(imageResponseText) as IUpsImageResponse;
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
        contentType,
        shipmentDateAndTime,
        responseBody: imageData,
      },
    });

    throw error;
  }
};

export default uploadUpsDocument;
