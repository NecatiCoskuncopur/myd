import * as yup from 'yup';

import { sysParamMessages } from '@/constants';

const { KEY, VALUE } = sysParamMessages;

export default yup.object({
  key: yup
    .string()
    .typeError(KEY.TYPE)
    .trim()
    .uppercase()
    .matches(/^[A-Z][A-Z0-9_]*$/, KEY.MATCH)
    .min(2, KEY.MIN)
    .max(100, KEY.MAX)
    .required(KEY.REQUIRED),
  value: yup.string().typeError(VALUE.TYPE).trim().min(1, VALUE.MIN).max(1000, VALUE.MAX).required(VALUE.REQUIRED),
});
