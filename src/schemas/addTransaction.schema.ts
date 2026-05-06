import * as yup from 'yup';

import { transactionMessages } from '@/constants';

const { AMOUNT, NOTE, TYPE, USERID } = transactionMessages;

export default yup.object({
  userId: yup.string().typeError(USERID.TYPE).required(USERID.REQUIRED),
  type: yup.string().oneOf(['PAY', 'SPEND'], TYPE.INVALID).required(TYPE.REQUIRED),
  amount: yup.number().typeError(AMOUNT.TYPE).min(0.01, AMOUNT.MIN).required(AMOUNT.REQUIRED),
  note: yup.string().typeError(NOTE.TYPE).max(35, NOTE.MAX),
});
