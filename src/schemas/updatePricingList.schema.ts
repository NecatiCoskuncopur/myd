import * as yup from 'yup';

import { messages } from '@/constants';
import createPricingListSchema from './createPricingList.schema';

const { PRICINGLIST } = messages;

const updatePricingListSchema = createPricingListSchema.shape({
  pricingListId: yup.string().typeError(PRICINGLIST.ID_TYPE).required(PRICINGLIST.ID_REQUIRED),
});

export default updatePricingListSchema;
