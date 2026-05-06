import * as yup from 'yup';

import { pricingListMessages, transactionMessages, userMessages } from '@/constants';
import editUserSchema from './editUser.schema';

const { ROLE, ISACTIVE, BARCODE_PERMITS } = userMessages;
const { USERID } = transactionMessages;

const setUserSchema = editUserSchema.shape({
  userId: yup.string().typeError(USERID.TYPE).required(USERID.REQUIRED),
  priceListId: yup.string().typeError(pricingListMessages.TYPE).required(pricingListMessages.REQUIRED),
  role: yup.string().oneOf(['CUSTOMER', 'ADMIN', 'OPERATOR'], ROLE.INVALID).required(ROLE.REQUIRED),
  isActive: yup.boolean().typeError(ISACTIVE.TYPE).required(ISACTIVE.REQUIRED),
  barcodePermits: yup.array().of(yup.string()).typeError(BARCODE_PERMITS.INVALID),
});

export default setUserSchema;
