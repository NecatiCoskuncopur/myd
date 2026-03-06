import * as yup from 'yup';

import { messages } from '@/constants';
import createShippingSchema from './createShipping.schema';

const { SHIPPING } = messages;

const updateShippingSchema = createShippingSchema.shape({
  shippingId: yup.string().typeError(SHIPPING.ID_TYPE).required(SHIPPING.ID_REQUIRED),
});

export default updateShippingSchema;
