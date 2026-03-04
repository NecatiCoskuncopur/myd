import * as yup from 'yup';

import { messages } from '@/constants';

const { USER, PASSWORD, TOKEN } = messages;

export default yup.object({
  email: yup.string().typeError(USER.EMAIL.TYPE).email(USER.EMAIL.INVALID).required(USER.EMAIL.REQUIRED),
  password: yup.string().typeError(PASSWORD.TYPE).min(8, PASSWORD.MIN).max(255, PASSWORD.MAX).required(PASSWORD.REQUIRED),
  recaptchaToken: yup.string().typeError(TOKEN.TYPE).required(TOKEN.REQUIRED),
});
