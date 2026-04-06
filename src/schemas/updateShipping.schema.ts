import * as yup from 'yup';

import { shippingMessages } from '@/constants';
import createShippingSchema from './createShipping.schema';

const { ID } = shippingMessages;

const updateShippingSchema = createShippingSchema.shape({
  shippingId: yup.string().typeError(ID.TYPE).required(ID.REQUIRED),
});

export default updateShippingSchema;
