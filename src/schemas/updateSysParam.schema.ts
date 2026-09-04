import * as yup from 'yup';

import { sysParamMessages } from '@/constants';
import createSysParamSchema from '@/schemas/createSysParam.schema';

const { ID } = sysParamMessages;

const updateSysParam = createSysParamSchema.shape({
  paramId: yup.string().typeError(ID.TYPE).required(ID.REQUIRED),
});

export default updateSysParam;
