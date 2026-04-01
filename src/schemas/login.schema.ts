import * as yup from 'yup';

import userMessages from '@/constants/messages/userMessages';

const { EMAIL, PASSWORD, TOKEN } = userMessages;

export default yup.object({
  email: yup.string().typeError(EMAIL.TYPE).email(EMAIL.INVALID).required(EMAIL.REQUIRED),
  password: yup.string().typeError(PASSWORD.TYPE).min(8, PASSWORD.MIN).max(255, PASSWORD.MAX).required(PASSWORD.REQUIRED),
  recaptchaToken: yup.string().typeError(TOKEN.TYPE).required(TOKEN.REQUIRED),
});
