import * as yup from 'yup';

import { messages } from '@/constants';

const { TRANSACTION } = messages;

export default yup.object({
  userId: yup.string().typeError(TRANSACTION.USERID_TYPE).required(TRANSACTION.USERID_REQUIRED),
  type: yup.string().oneOf(['PAY', 'SPEND'], TRANSACTION.TYPE_INVALID).required(TRANSACTION.TYPE_REQUIRED),
  amount: yup.number().typeError(TRANSACTION.AMOUNT_TYPE).min(0.01, TRANSACTION.AMOUNT_MIN).required(TRANSACTION.AMOUNT_REQUIRED),
  note: yup.string().typeError(TRANSACTION.NOTE_TYPE).max(35, TRANSACTION.NOTE_MAX),
});
