import * as yup from 'yup';

import { userMessages } from '@/constants';
import baseUserSchema from '@/schemas/baseUserSchema';

const { NICKNAME } = userMessages;

const editUserSchema = baseUserSchema.shape({
  nickname: yup
    .string()
    .transform(value => (value === '' ? undefined : value))
    .typeError(NICKNAME.TYPE)
    .min(4, NICKNAME.MIN)
    .max(75, NICKNAME.MAX),
});

export default editUserSchema;
