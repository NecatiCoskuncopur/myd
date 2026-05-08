import * as yup from 'yup';

import { addressMessages, shippingMessages, userMessages } from '@/constants';

const { CITY, COUNTRY, LINE, POSTALCODE, STATE } = addressMessages;
const { COMPANY, EMAIL, PHONE } = userMessages;
const { CONSIGNEE, CURRENCY, DESCRIPTION, FREIGHT, HARMONIZED_CODE_TYPE, HEIGHT, NUMBEROFPACKAGE, IOSSNUMBER, LENGTH, PAYOR, PRODUCT, PURPOSE, WEIGHT, WIDTH } =
  shippingMessages;

export default yup.object({
  senderId: yup.string(),
  consignee: yup.object({
    _id: yup.string(),
    name: yup.string().typeError(CONSIGNEE.NAME.TYPE).min(4, CONSIGNEE.NAME.MIN).max(35, CONSIGNEE.NAME.MAX).required(CONSIGNEE.NAME.REQUIRED),
    company: yup.string().typeError(COMPANY.TYPE).min(5, COMPANY.MIN).max(75, COMPANY.MAX),
    phone: yup.string().typeError(PHONE.TYPE).length(10, PHONE.LENGTH),
    email: yup.string().typeError(EMAIL.TYPE).email(EMAIL.INVALID),
    taxId: yup.string().typeError(CONSIGNEE.TAXID.TYPE).max(35, CONSIGNEE.TAXID.MAX),
    address: yup.object({
      line1: yup.string().typeError(LINE.TYPE).min(5, LINE.MIN).max(255, LINE.MAX).required(LINE.REQUIRED),
      line2: yup.string().typeError(LINE.TYPE).max(255, LINE.MAX),
      city: yup.string().typeError(CITY.TYPE).min(2, CITY.MIN).max(35, CITY.MAX).required(CITY.REQUIRED),
      country: yup.string().typeError(COUNTRY.TYPE).min(2, COUNTRY.MIN).max(45, COUNTRY.MAX).required(COUNTRY.REQUIRED),
      state: yup
        .string()
        .transform(value => (value === '' ? undefined : value))
        .nullable()
        .notRequired()
        .min(2, STATE.MIN)
        .max(45, STATE.MAX),
      postalCode: yup.string().typeError(POSTALCODE.TYPE).length(5, POSTALCODE.LENGTH).required(POSTALCODE.REQUIRED),
    }),
  }),
  detail: yup.object({
    payor: yup
      .object({
        shipping: yup.string().oneOf(['SENDER', 'CONSIGNEE'], PAYOR.SHIPMENT.TYPE_INVALID).required(PAYOR.SHIPMENT.TYPE_REQUIRED),
        customs: yup.string().oneOf(['SENDER', 'CONSIGNEE'], PAYOR.CUSTOMS.TYPE_INVALID).required(PAYOR.CUSTOMS.TYPE_REQUIRED),
      })
      .required(),
    iossNumber: yup
      .string()
      .transform(value => (value === '' ? undefined : value))
      .nullable()
      .notRequired()
      .length(12, IOSSNUMBER.LENGTH),
    purpose: yup.string().oneOf(['GIFT', 'PERSONAL', 'SAMPLE', 'REPAIR_OR_RETURN', 'COMMERICAL'], PURPOSE.INVALID).required(PURPOSE.REQUIRED),
  }),
  content: yup.object({
    currency: yup.string().oneOf(['USD', 'EUR', 'GBP'], CURRENCY.INVALID).required(CURRENCY.REQUIRED),
    description: yup.string().typeError(DESCRIPTION.TYPE).max(50, DESCRIPTION.MAX),
    freight: yup.number().typeError(FREIGHT.TYPE).min(1, FREIGHT.MIN),
    products: yup
      .array()
      .of(
        yup.object({
          name: yup.string().typeError(PRODUCT.NAME.TYPE).min(2, PRODUCT.NAME.MIN).max(25, PRODUCT.NAME.MAX).required(PRODUCT.NAME.REQUIRED),
          piece: yup.number().typeError(PRODUCT.PIECE.TYPE).min(1, PRODUCT.PIECE.MIN).required(PRODUCT.PIECE.REQUIRED),
          unitPrice: yup.number().typeError(PRODUCT.UNITPRICE.TYPE).required(PRODUCT.UNITPRICE.REQUIRED),
          harmonizedCode: yup.string().typeError(HARMONIZED_CODE_TYPE),
        }),
      )
      .min(1)
      .required(),
  }),
  package: yup.object({
    weight: yup.number().typeError(WEIGHT.TYPE).min(0.1, WEIGHT.MIN).required(WEIGHT.REQUIRED),
    numberOfPackage: yup.number().typeError(NUMBEROFPACKAGE.TYPE).min(1, NUMBEROFPACKAGE.MIN).max(55, NUMBEROFPACKAGE.MAX).required(NUMBEROFPACKAGE.REQUIRED),
    width: yup.number().typeError(WIDTH.TYPE).min(0.5, WIDTH.MIN).max(500, WIDTH.MAX).required(WIDTH.REQUIRED),
    height: yup.number().typeError(HEIGHT.TYPE).min(0.5, HEIGHT.MIN).max(500, HEIGHT.MAX).required(HEIGHT.REQUIRED),
    length: yup.number().typeError(LENGTH.TYPE).min(0.5, LENGTH.MIN).max(500, LENGTH.MAX).required(LENGTH.REQUIRED),
    volumetricWeight: yup.number().required(),
  }),
});
