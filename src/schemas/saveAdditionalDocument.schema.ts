import * as yup from 'yup';

import { AdditionalDocumentContentTypeEnum, additionalDocumentMessages } from '@/constants';

const { FILE } = additionalDocumentMessages;

export default yup.object({
  shippingId: yup.string().optional(),
  file: yup
    .mixed<File>()
    .required(FILE.REQUIRED)
    .test('file-type', FILE.TYPE_INVALID, value => {
      if (!(value instanceof File)) {
        return false;
      }

      return Object.values(AdditionalDocumentContentTypeEnum).includes(value.type as AdditionalDocumentContentTypeEnum);
    }),
});
