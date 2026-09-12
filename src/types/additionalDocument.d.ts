import { AdditionalDocumentEnum } from '@/constants';

declare namespace AdditionalDocumentTypes {
  interface ISaveAdditionalDocumentPayload {
    file: File;
    type: AdditionalDocumentEnum;
  }
}
