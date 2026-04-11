import * as yup from 'yup';

import { userMessages } from '@/constants';
import adminCreateUserSchema from './adminCreateUser.schema';

const { TOKEN } = userMessages;

const createUserSchema = adminCreateUserSchema.shape({
  recaptchaToken: yup.string().typeError(TOKEN.TYPE).required(TOKEN.REQUIRED),
});

export default createUserSchema;
