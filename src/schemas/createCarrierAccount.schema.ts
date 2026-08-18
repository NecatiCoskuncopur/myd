import * as yup from 'yup';

import { addressMessages, Carrier, carrierMessages, pricingListMessages, userMessages } from '@/constants';

const { ACCOUNTNUMBER, CARRIER, CREDENTIALS, NAME } = carrierMessages;
const { CITY, DISTRICT, LINE, POSTALCODE } = addressMessages;
const { COMPANY, EMAIL, FIRSTNAME, LASTNAME, PHONE } = userMessages;
const { ZONE } = pricingListMessages;

export default yup.object({
  name: yup.string().typeError(NAME.TYPE).min(2, NAME.MIN).max(75, NAME.MAX).required(NAME.REQUIRED),
  displayName: yup.string().typeError(NAME.TYPE).min(2, NAME.MIN).max(75, NAME.MAX).required(NAME.REQUIRED),
  carrier: yup.string().oneOf(Object.values(Carrier), CARRIER.TYPE_INVALID).required(CARRIER.REQUIRED),
  accountNumber: yup.string().typeError(ACCOUNTNUMBER.TYPE).min(1, ACCOUNTNUMBER.MIN).required(ACCOUNTNUMBER.REQUIRED),
  credentials: yup
    .array()
    .of(
      yup.object({
        key: yup.string().required(CREDENTIALS.KEY_REQUIRED),
        value: yup.string().required(CREDENTIALS.VALUE_REQUIRED),
      }),
    )
    .min(2, CREDENTIALS.MIN)
    .required(CREDENTIALS.REQUIRED),
  isActive: yup.boolean().default(true),
  hasCustomInfo: yup.boolean().required().default(false),
  pricing: yup.object({
    zones: yup
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

          than: yup.number().min(0.1, ZONE.PRICES.PRICE_MIN).required(ZONE.THAN_REQUIRED),
        }),
      )
      .min(1)
      .required(ZONE.REQUIRED),
  }),
  customInfo: yup.object().when('hasCustomInfo', {
    is: true,
    then: schema =>
      schema.shape({
        email: yup.string().typeError(EMAIL.TYPE).email(EMAIL.INVALID).required(EMAIL.REQUIRED),
        firstName: yup.string().typeError(FIRSTNAME.TYPE).min(2, FIRSTNAME.MIN).max(75, FIRSTNAME.MAX).required(FIRSTNAME.REQUIRED),
        lastName: yup.string().typeError(LASTNAME.TYPE).min(2, LASTNAME.MIN).max(75, LASTNAME.MAX).required(LASTNAME.REQUIRED),
        company: yup.string().typeError(COMPANY.TYPE).min(2, COMPANY.MIN).max(75, COMPANY.MAX),
        phone: yup.string().typeError(PHONE.TYPE).length(10, PHONE.LENGTH).required(PHONE.REQUIRED),
        address: yup.object({
          line1: yup.string().typeError(LINE.TYPE).min(5, LINE.MIN).max(255, LINE.MAX).required(LINE.REQUIRED),
          line2: yup.string().typeError(LINE.TYPE).max(255, LINE.MAX),
          district: yup.string().typeError(DISTRICT.TYPE).min(2, DISTRICT.MIN).max(25, DISTRICT.MAX).required(DISTRICT.REQUIRED),
          city: yup.string().typeError(CITY.TYPE).min(2, CITY.MIN).max(35, CITY.MAX).required(CITY.REQUIRED),
          postalCode: yup.string().typeError(POSTALCODE.TYPE).length(5, POSTALCODE.LENGTH).required(POSTALCODE.REQUIRED),
        }),
      }),

    otherwise: schema => schema.optional().nullable(),
  }),

  meta: yup.object().nullable().optional(),
});
