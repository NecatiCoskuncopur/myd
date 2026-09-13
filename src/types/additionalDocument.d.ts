import { AdditionalDocumentContentTypeEnum, AdditionalDocumentEnum } from '@/constants';

declare namespace AdditionalDocumentTypes {
  interface ISaveAdditionalDocumentPayload {
    file: File;
    type: AdditionalDocumentEnum;
    shippingId?: string;
  }

  interface IAdditionalDocument {
    id: string;
    type: AdditionalDocumentEnum;
    contentType: AdditionalDocumentContentTypeEnum;
  }
}
