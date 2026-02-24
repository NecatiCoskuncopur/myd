import * as yup from 'yup';

import { messages } from '@/constants';

export default yup.object({
  newPassword: yup
    .string()
    .typeError(messages.PASSWORD.TYPE)
    .min(8, messages.PASSWORD.MIN)
    .max(255, messages.PASSWORD.MAX)
    .required(messages.PASSWORD.REQUIRED),

  token: yup.string().typeError(messages.TOKEN.TYPE).required(messages.TOKEN.REQUIRED),
});
