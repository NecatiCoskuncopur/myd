import * as yup from 'yup';

import { addressMessages, userMessages } from '@/constants';

const { COMPANY, EMAIL, FIRSTNAME, LASTNAME, PHONE, PASSWORD, TOKEN } = userMessages;
const { CITY, DISTRICT, LINE, POSTALCODE } = addressMessages;

export default yup.object({
  recaptchaToken: yup.string().typeError(TOKEN.TYPE).required(TOKEN.REQUIRED),
  password: yup.string().typeError(PASSWORD.TYPE).min(8, PASSWORD.MIN).max(255, PASSWORD.MAX).required(PASSWORD.REQUIRED),
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
});
