import * as yup from 'yup';

import { messages } from '@/constants';

const { PASSWORD } = messages;

export default yup.object({
  currentPassword: yup.string().typeError(PASSWORD.TYPE).min(8, PASSWORD.MIN).max(255, PASSWORD.MAX).required(PASSWORD.REQUIRED),
  newPassword: yup.string().typeError(PASSWORD.TYPE).min(8, PASSWORD.MIN).max(255, PASSWORD.MAX).required(PASSWORD.REQUIRED),
});
