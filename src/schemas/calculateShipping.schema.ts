import * as yup from 'yup';

import { messages } from '@/constants';

const { SHIPPING } = messages;

export default yup.object({
  weight: yup.number().typeError(SHIPPING.WEIGHT_TYPE).min(0.5, SHIPPING.WEIGHT_MIN).required(SHIPPING.WEIGHT_REQUIRED),
  countryCode: yup.string().typeError(SHIPPING.COUNTRYCODE.TYPE).length(2, SHIPPING.COUNTRYCODE.LENGTH).required(SHIPPING.COUNTRYCODE.REQUIRED),
});
