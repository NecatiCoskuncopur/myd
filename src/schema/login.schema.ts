import * as yup from 'yup';

import { messages } from '@/constants';

export default yup.object({
  email: yup.string().typeError(messages.EMAIL.TYPE).email(messages.EMAIL.INVALID).required(messages.EMAIL.REQUIRED),
  password: yup.string().typeError(messages.PASSWORD.TYPE).min(8, messages.PASSWORD.MIN).max(255, messages.PASSWORD.MAX).required(messages.PASSWORD.REQUIRED),
  recaptchaToken: yup.string().typeError(messages.TOKEN.TYPE).required(messages.TOKEN.REQUIRED),
});
