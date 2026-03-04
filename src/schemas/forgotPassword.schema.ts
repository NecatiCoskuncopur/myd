import * as yup from 'yup';

import { messages } from '@/constants';

const { USER } = messages;

export default yup.object({
  email: yup.string().typeError(USER.EMAIL.TYPE).email(USER.EMAIL.INVALID).required(USER.EMAIL.REQUIRED),
});
