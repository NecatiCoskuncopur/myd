import * as yup from 'yup';

import { messages } from '@/constants';

const { ADDRESS, SHIPPING, USER } = messages;
const { CITY, COUNTRY, LINE, POSTALCODE, STATE } = ADDRESS;
const { COMPANY, EMAIL, PHONE } = USER;

export default yup.object({
  senderId: yup.string(),
  consignee: yup.object({
    _id: yup.string(),
    name: yup
      .string()
      .typeError(SHIPPING.CONSIGNEE.NAME_TYPE)
      .min(4, SHIPPING.CONSIGNEE.NAME_MIN)
      .max(35, SHIPPING.CONSIGNEE.NAME_MAX)
      .required(SHIPPING.CONSIGNEE.NAME_REQUIRED),
    company: yup.string().typeError(COMPANY.TYPE).min(5, COMPANY.MIN).max(75, COMPANY.MAX),
    phone: yup.string().typeError(PHONE.TYPE).length(10, PHONE.LENGTH),
    email: yup.string().typeError(EMAIL.TYPE).email(EMAIL.INVALID),
    taxId: yup.string().typeError(SHIPPING.CONSIGNEE.TAXID_TYPE).max(35, SHIPPING.CONSIGNEE.TAXID_MAX),
    address: yup.object({
      line1: yup.string().typeError(LINE.TYPE).min(5, LINE.MIN).max(255, LINE.MAX).required(LINE.REQUIRED),
      line2: yup.string().typeError(LINE.TYPE).max(255, LINE.MAX),
      city: yup.string().typeError(CITY.TYPE).min(2, CITY.MIN).max(35, CITY.MAX).required(CITY.REQUIRED),
      country: yup.string().typeError(COUNTRY.TYPE).min(2, COUNTRY.MIN).max(45, COUNTRY.MAX).required(COUNTRY.REQUIRED),
      state: yup.string().typeError(STATE.TYPE).min(2, STATE.MIN).max(45, STATE.MAX),
      postalCode: yup.string().typeError(POSTALCODE.TYPE).length(5, POSTALCODE.LENGTH).required(POSTALCODE.REQUIRED),
    }),
  }),
  detail: yup.object({
    payor: yup
      .object({
        shipping: yup.string().oneOf(['SENDER', 'CONSIGNEE'], SHIPPING.TYPE_INVALID).required(SHIPPING.TYPE_REQUIRED),
        customs: yup.string().oneOf(['SENDER', 'CONSIGNEE'], SHIPPING.CUSTOMS.TYPE_INVALID).required(SHIPPING.CUSTOMS.TYPE_REQUIRED),
      })
      .required(),
    iossNumber: yup.string().typeError(SHIPPING.IOSNUMBER_TYPE).length(12, SHIPPING.IOSNUMBER_LENGTH),
    purpose: yup.string().oneOf(['GIFT', 'PERSONAL', 'SAMPLE', 'REPAIR_OR_RETURN', 'COMMERICAL'], SHIPPING.PURPOSE_INVALID).required(SHIPPING.PURPOSE_REQUIRED),
  }),
  content: yup.object({
    currency: yup.string().oneOf(['USD', 'EUR', 'GBP'], SHIPPING.CURRENCY_INVALID).required(SHIPPING.CURRENCY_REQUIRED),
    description: yup.string().typeError(SHIPPING.DESCRIPTION_TYPE).max(50, SHIPPING.DESCRIPTION_MAX),
    freight: yup.number().typeError(SHIPPING.FREIGHT_TYPE).min(1, SHIPPING.FREIGHT_MIN),
    products: yup
      .array()
      .of(
        yup.object({
          name: yup
            .string()
            .typeError(SHIPPING.PRODUCT_NAME_TYPE)
            .min(2, SHIPPING.PRODUCT_NAME_MIN)
            .max(25, SHIPPING.PRODUCT_NAME_MAX)
            .required(SHIPPING.PRODUCT_NAME_REQUIRED),
          piece: yup.number().typeError(SHIPPING.PRODUCT_PIECE_TYPE).min(1, SHIPPING.PRODUCT_PIECE_MIN).required(SHIPPING.PRODUCT_PIECE_REQUIRED),
          unitPrice: yup.number().typeError(SHIPPING.PRODUCT_UNITPRICE_TYPE).required(SHIPPING.PRODUCT_UNITPRICE_REQUIRED),
          harmonizedCode: yup.string().typeError(SHIPPING.HARMONIZED_CODE_TYPE),
        }),
      )
      .min(1)
      .required(),
  }),
  package: yup.object({
    weight: yup.number().typeError(SHIPPING.WEIGHT_TYPE).min(0.5, SHIPPING.WEIGHT_MIN).required(SHIPPING.WEIGHT_REQUIRED),
    numberOfPackage: yup
      .number()
      .typeError(SHIPPING.NUMBER_OF_PACKAGE_TYPE)
      .min(1, SHIPPING.NUMBER_OF_PACKAGE_MIN)
      .max(55, SHIPPING.NUMBER_OF_PACKAGE_MAX)
      .required(SHIPPING.NUMBER_OF_PACKAGE_REQUIRED),
    width: yup.number().typeError(SHIPPING.WIDTH_TYPE).min(0.5, SHIPPING.WIDTH_MIN).max(500, SHIPPING.WIDTH_MAX).required(SHIPPING.WIDTH_REQUIRED),
    height: yup.number().typeError(SHIPPING.HEIGHT_TYPE).min(0.5, SHIPPING.HEIGHT_MIN).max(500, SHIPPING.HEIGHT_MAX).required(SHIPPING.HEIGHT_REQUIRED),
    length: yup.number().typeError(SHIPPING.LENGTH_TYPE).min(0.5, SHIPPING.LENGTH_MIN).max(500, SHIPPING.LENGTH_MAX).required(SHIPPING.LENGTH_REQUIRED),
  }),
});
