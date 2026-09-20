import { AdditionalDocumentContentTypeEnum } from '@/constants';

declare namespace AdditionalDocumentTypes {
  interface ISaveAdditionalDocumentPayload {
    file: File;
    shippingId?: string;
  }

  interface IAdditionalDocument {
    id: string;
    contentType: AdditionalDocumentContentTypeEnum;
  }
}
