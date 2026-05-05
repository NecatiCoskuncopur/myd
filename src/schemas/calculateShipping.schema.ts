import * as yup from 'yup';

import { shippingMessages } from '@/constants';

const { COUNTRYCODE, WEIGHT } = shippingMessages;

export default yup.object({
  weight: yup.number().typeError(WEIGHT.TYPE).min(0.5, WEIGHT.MIN).required(WEIGHT.REQUIRED),
  countryCode: yup.string().typeError(COUNTRYCODE.TYPE).length(2, COUNTRYCODE.LENGTH).required(COUNTRYCODE.REQUIRED),
});
