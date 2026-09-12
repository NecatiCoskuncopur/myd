import * as yup from 'yup';

import { AdditionalDocumentContentTypeEnum, AdditionalDocumentEnum, additionalDocumentMessages } from '@/constants';

const { DOCUMENT_TYPE, FILE } = additionalDocumentMessages;

export default yup.object({
  file: yup
    .mixed<File>()
    .required(FILE.REQUIRED)
    .test('file-type', FILE.TYPE_INVALID, value => {
      if (!(value instanceof File)) {
        return false;
      }

      return Object.values(AdditionalDocumentContentTypeEnum).includes(value.type as AdditionalDocumentContentTypeEnum);
    }),

  type: yup.mixed<AdditionalDocumentEnum>().oneOf(Object.values(AdditionalDocumentEnum), DOCUMENT_TYPE.INVALID).required(DOCUMENT_TYPE.REQUIRED),
});
