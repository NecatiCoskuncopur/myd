import * as yup from 'yup';

import { shippingDocumentMessages } from '@/constants';

const { ADDITIONALDOCUMENT, SHIPPINGID } = shippingDocumentMessages;

export default yup.object({
  shippingId: yup.string().typeError(SHIPPINGID.TYPE).required(SHIPPINGID.REQUIRED),
  additionalDocument: yup.mixed<Buffer>().typeError(ADDITIONALDOCUMENT.TYPE).optional(),
});
