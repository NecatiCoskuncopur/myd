import * as yup from 'yup';

import { shippingMessages } from '@/constants';

const { HEIGHT, LENGTH, WEIGHT, WIDTH, ID } = shippingMessages;

export default yup.object({
  shippingId: yup.string().typeError(ID.TYPE).required(ID.REQUIRED),
  weight: yup.number().typeError(WEIGHT.TYPE).min(0.1, WEIGHT.MIN).required(WEIGHT.REQUIRED),
  width: yup.number().typeError(WIDTH.TYPE).min(0.5, WIDTH.MIN).max(500, WIDTH.MAX).required(WIDTH.REQUIRED),
  height: yup.number().typeError(HEIGHT.TYPE).min(0.5, HEIGHT.MIN).max(500, HEIGHT.MAX).required(HEIGHT.REQUIRED),
  length: yup.number().typeError(LENGTH.TYPE).min(0.5, LENGTH.MIN).max(500, LENGTH.MAX).required(LENGTH.REQUIRED),
});
