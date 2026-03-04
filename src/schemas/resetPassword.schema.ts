import * as yup from 'yup';

import { messages } from '@/constants';

const { PASSWORD, TOKEN } = messages;

export default yup.object({
  newPassword: yup.string().typeError(PASSWORD.TYPE).min(8, PASSWORD.MIN).max(255, PASSWORD.MAX).required(PASSWORD.REQUIRED),
  token: yup.string().typeError(TOKEN.TYPE).required(TOKEN.REQUIRED),
});
