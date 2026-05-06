import * as yup from 'yup';

import { carrierMessages } from '@/constants';
import createCarrierAccountSchema from './createCarrierAccount.schema';

const updateCarrierAccountSchema = createCarrierAccountSchema.shape({
  id: yup.string().typeError(carrierMessages.UPDATE.ID_TYPE).required(carrierMessages.UPDATE.ID_REQUIRED),
});

export default updateCarrierAccountSchema;
