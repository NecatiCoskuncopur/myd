import * as yup from 'yup';
import { userMessages } from '@/constants';
import baseUserSchema from '@/schemas/baseUserSchema';

const { NICKNAME, PASSWORD } = userMessages;

const adminCreateUserSchema = baseUserSchema.shape({
  password: yup.string().typeError(PASSWORD.TYPE).min(8, PASSWORD.MIN).max(255, PASSWORD.MAX).required(PASSWORD.REQUIRED),
  nickname: yup
    .string()
    .transform(value => (value === '' ? undefined : value))
    .typeError(NICKNAME.TYPE)
    .min(4, NICKNAME.MIN)
    .max(75, NICKNAME.MAX),
});

export default adminCreateUserSchema;
