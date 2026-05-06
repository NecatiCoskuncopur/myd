import * as yup from 'yup';

import { pricingListMessages } from '@/constants';
import createPricingListSchema from './createPricingList.schema';

const updatePricingListSchema = createPricingListSchema.shape({
  pricingListId: yup.string().typeError(pricingListMessages.ID_TYPE).required(pricingListMessages.ID_REQUIRED),
});

export default updatePricingListSchema;
