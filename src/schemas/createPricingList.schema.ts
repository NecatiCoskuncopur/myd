import * as yup from 'yup';

import { pricingListMessages } from '@/constants';

const { NAME, ZONE } = pricingListMessages;

export default yup.object({
  name: yup.string().typeError(NAME.TYPE).min(2, NAME.MIN).max(75, NAME.MAX).trim().required(NAME.REQUIRED),

  zone: yup
    .array()
    .of(
      yup.object({
        number: yup.number().typeError(ZONE.NUMBER.TYPE).integer().min(1, ZONE.NUMBER.MIN).required(ZONE.NUMBER.REQUIRED),
        prices: yup
          .array()
          .of(
            yup.object({
              weight: yup.number().typeError(ZONE.PRICES.WEIGHT_TYPE).min(0.1, ZONE.PRICES.WEIGHT_MIN).required(ZONE.PRICES.WEIGHT_REQUIRED),
              price: yup.number().typeError(ZONE.PRICES.PRICE_TYPE).min(0.1, ZONE.PRICES.PRICE_MIN).required(ZONE.PRICES.PRICE_REQUIRED),
            }),
          )
          .min(1)
          .required(),

        than: yup.number().min(0.1, ZONE.PRICES.PRICE_REQUIRED).required(ZONE.THAN_REQUIRED),
      }),
    )
    .min(1)
    .required(ZONE.REQUIRED),
});
