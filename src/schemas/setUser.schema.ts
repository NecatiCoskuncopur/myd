import * as yup from 'yup';

import { messages } from '@/constants';
import editUserSchema from './editUser.schema';

const { USER, PRICINGLIST, TRANSACTION } = messages;

const { BARCODE_PERMITS, ISACTIVE, ROLE } = USER;

const setUserSchema = editUserSchema.shape({
  userId: yup.string().typeError(TRANSACTION.USERID_TYPE).required(TRANSACTION.USERID_REQUIRED),
  priceListId: yup.string().typeError(PRICINGLIST.TYPE).required(PRICINGLIST.REQUIRED),
  role: yup.string().oneOf(['CUSTOMER', 'ADMIN', 'OPERATOR'], ROLE.INVALID).required(ROLE.REQUIRED),
  isActive: yup.boolean().typeError(ISACTIVE.TYPE).required(ISACTIVE.REQUIRED),
  barcodePermits: yup.array().of(yup.string()).typeError(BARCODE_PERMITS.INVALID),
});

export default setUserSchema;
