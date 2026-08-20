import * as yup from 'yup';

import { CarrierAccountTypeEnum, shippingMessages } from '@/constants';

const { COUNTRYCODE, WEIGHT } = shippingMessages;

export default yup.object({
  serviceType: yup.mixed<CarrierAccountTypeEnum>().oneOf(Object.values(CarrierAccountTypeEnum)).required(),
  weight: yup.number().typeError(WEIGHT.TYPE).min(0.1, WEIGHT.MIN).required(WEIGHT.REQUIRED),
  countryCode: yup.string().typeError(COUNTRYCODE.TYPE).length(2, COUNTRYCODE.LENGTH).required(COUNTRYCODE.REQUIRED),
});
