import * as yup from 'yup';

import { messages } from '@/constants';
import editUserSchema from './editUser.schema';

const { TOKEN } = messages;

const createUserSchema = editUserSchema.shape({
  recaptchaToken: yup.string().typeError(TOKEN.TYPE).required(TOKEN.REQUIRED),
});

export default createUserSchema;
