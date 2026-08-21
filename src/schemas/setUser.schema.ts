import * as yup from 'yup';

import { transactionMessages, userMessages } from '@/constants';

import editUserSchema from './editUser.schema';

const { ROLE, ISACTIVE, BARCODE_PERMITS, NICKNAME } = userMessages;
const { USERID } = transactionMessages;

const setUserSchema = editUserSchema.shape({
  userId: yup.string().typeError(USERID.TYPE).required(USERID.REQUIRED),
  priceLists: yup
    .array()
    .of(
      yup.object({
        serviceType: yup.string().required(),
        priceListId: yup.string().required(),
      }),
    )
    .test('unique-service-types', 'Duplicate service type', value => {
      if (!value) return true;
      const types = value.map(item => item.serviceType);
      return new Set(types).size === types.length;
    }),
  role: yup.string().oneOf(['CUSTOMER', 'ADMIN', 'OPERATOR'], ROLE.INVALID).required(ROLE.REQUIRED),
  nickname: yup
    .string()
    .transform(value => (value === '' ? undefined : value))
    .typeError(NICKNAME.TYPE)
    .min(4, NICKNAME.MIN)
    .max(75, NICKNAME.MAX),
  isActive: yup.boolean().typeError(ISACTIVE.TYPE).required(ISACTIVE.REQUIRED),
  barcodePermits: yup.array().of(yup.string()).typeError(BARCODE_PERMITS.INVALID),
});

export default setUserSchema;
