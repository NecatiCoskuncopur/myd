import * as yup from 'yup';

import { userMessages } from '@/constants';
import baseUserSchema from '@/schemas/baseUserSchema';

const { PASSWORD, TOKEN } = userMessages;

const createUserSchema = baseUserSchema.shape({
  recaptchaToken: yup.string().typeError(TOKEN.TYPE).required(TOKEN.REQUIRED),
  password: yup.string().typeError(PASSWORD.TYPE).min(8, PASSWORD.MIN).max(255, PASSWORD.MAX).required(PASSWORD.REQUIRED),
});

export default createUserSchema;
