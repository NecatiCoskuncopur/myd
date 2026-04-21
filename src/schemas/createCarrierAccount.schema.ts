import * as yup from 'yup';

import { carrierMessages } from '@/constants';

const { ACCOUNTNUMBER, CARRIER, CREDENTIALS, NAME } = carrierMessages;

export default yup.object({
  name: yup.string().typeError(NAME.TYPE).min(2, NAME.MIN).max(75, NAME.MAX).required(NAME.REQUIRED),
  carrier: yup.string().oneOf(['FEDEX', 'UPS'], CARRIER.TYPE_INVALID).required(CARRIER.REQUIRED),
  accountNumber: yup.string().typeError(ACCOUNTNUMBER.TYPE).min(1, ACCOUNTNUMBER.MIN).required(ACCOUNTNUMBER.REQUIRED),

  credentials: yup
    .array()
    .of(
      yup.object({
        key: yup.string().required(CREDENTIALS.KEY_REQUIRED),
        value: yup.string().required(CREDENTIALS.VALUE_REQUIRED),
      }),
    )
    .min(2, CREDENTIALS.MIN)
    .required(CREDENTIALS.REQUIRED),
});
