import * as yup from 'yup';

import { addressMessages, Carrier, CarrierAccountTypeEnum, carrierMessages, NavlungoFirmEnum, pricingListMessages, userMessages } from '@/constants';

const { ACCOUNTNUMBER, ACCOUNTTYPE, CARRIER, CREDENTIALS, NAME, NAVLUNGOFIRM, LONGSIDE } = carrierMessages;
const { CITY, DISTRICT, LINE, POSTALCODE } = addressMessages;
const { COMPANY, EMAIL, FULLNAME, PHONE } = userMessages;
const { ZONE } = pricingListMessages;

const emptyToUndefined = (value: string) => (value === '' ? undefined : value);

export default yup.object({
  name: yup.string().typeError(NAME.TYPE).min(2, NAME.MIN).max(75, NAME.MAX).required(NAME.REQUIRED),
  displayName: yup.string().typeError(NAME.TYPE).min(2, NAME.MIN).max(75, NAME.MAX).required(NAME.REQUIRED),
  carrier: yup.string().oneOf(Object.values(Carrier), CARRIER.TYPE_INVALID).required(CARRIER.REQUIRED),
  navlungoFirm: yup.string().oneOf(Object.values(NavlungoFirmEnum), NAVLUNGOFIRM.INVALID).optional().nullable(),
  accountType: yup.string().oneOf(Object.values(CarrierAccountTypeEnum), ACCOUNTTYPE.INVALID).required(ACCOUNTTYPE.REQUIRED),
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
  longSideSurcharge: yup.object({
    isActive: yup.boolean().required().default(false),
    price: yup.number().when('isActive', {
      is: true,
      then: schema => schema.typeError(LONGSIDE.PRICE.TYPE).min(0, LONGSIDE.PRICE.MIN).required(LONGSIDE.PRICE.REQUIRED),
      otherwise: schema => schema.optional().nullable(),
    }),
    limit: yup.number().when('isActive', {
      is: true,
      then: schema => schema.typeError(LONGSIDE.LIMIT.TYPE).min(0.1, LONGSIDE.LIMIT.MIN).required(LONGSIDE.LIMIT.REQUIRED),
      otherwise: schema => schema.optional().nullable(),
    }),
  }),

  customInfo: yup
    .object({
      email: yup.string().transform(emptyToUndefined).email(EMAIL.INVALID).optional(),
      fullName: yup.string().transform(emptyToUndefined).min(2, FULLNAME.MIN).max(150, FULLNAME.MAX).optional(),
      company: yup.string().transform(emptyToUndefined).typeError(COMPANY.TYPE).min(2, COMPANY.MIN).max(75, COMPANY.MAX).optional(),
      phone: yup.string().transform(emptyToUndefined).length(10, PHONE.LENGTH).optional(),

      address: yup
        .object({
          line1: yup.string().transform(emptyToUndefined).min(5, LINE.MIN).max(255, LINE.MAX).optional(),
          line2: yup.string().transform(emptyToUndefined).max(255, LINE.MAX).optional(),
          district: yup.string().transform(emptyToUndefined).min(2, DISTRICT.MIN).max(25, DISTRICT.MAX).optional(),
          city: yup.string().transform(emptyToUndefined).min(2, CITY.MIN).max(35, CITY.MAX).optional(),
          postalCode: yup.string().transform(emptyToUndefined).length(5, POSTALCODE.LENGTH).optional(),
        })
        .transform(value => {
          if (!value) return undefined;
          const hasValues = Object.values(value).some(v => v !== undefined && v !== '');
          return hasValues ? value : undefined;
        })
        .optional(),
    })
    .nullable()
    .optional()
    .transform(value => {
      if (value === null) return null;
      if (!value) return undefined;
      const hasValues = Object.values(value).some(v => v !== undefined && v !== '');
      return hasValues ? value : undefined;
    }),

  meta: yup.object().nullable().optional(),
});
