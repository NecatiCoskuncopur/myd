import * as yup from 'yup';

import { userMessages } from '@/constants';

const { EMAIL, TOKEN } = userMessages;

export default yup.object({
  recaptchaToken: yup.string().typeError(TOKEN.TYPE).required(TOKEN.REQUIRED),
  email: yup.string().typeError(EMAIL.TYPE).email(EMAIL.INVALID).required(EMAIL.REQUIRED),
});
