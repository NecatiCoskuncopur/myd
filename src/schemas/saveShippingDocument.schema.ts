import * as yup from 'yup';

import { shippingDocumentMessages } from '@/constants';

const { INVOICE, LABEL, SHIPPINGID } = shippingDocumentMessages;

export default yup.object({
  shippingId: yup.string().typeError(SHIPPINGID.TYPE).required(SHIPPINGID.REQUIRED),
  label: yup.mixed<Buffer>().typeError(LABEL.TYPE).required(LABEL.REQUIRED),
  invoice: yup.mixed<Buffer>().typeError(INVOICE.TYPE).optional(),
});
