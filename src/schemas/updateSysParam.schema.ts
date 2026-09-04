import * as yup from 'yup';

import { sysParamMessages } from '@/constants';
import createShippingSchema from '@/schemas/createShipping.schema';

const { ID } = sysParamMessages;

const updateSysParam = createShippingSchema.shape({
  paramId: yup.string().typeError(ID.TYPE).required(ID.REQUIRED),
});

export default updateSysParam;
