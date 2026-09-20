import * as yup from 'yup';

import { addressMessages, shippingMessages } from '@/constants';

const { COUNTRY } = addressMessages;
const { WEIGHT } = shippingMessages;

export default yup.object({
  weight: yup.number().typeError(WEIGHT.TYPE).min(0.1, WEIGHT.MIN).required(WEIGHT.REQUIRED),
  country: yup.string().typeError(COUNTRY.TYPE).min(2, COUNTRY.MIN).max(45, COUNTRY.MAX).required(COUNTRY.REQUIRED),
});
