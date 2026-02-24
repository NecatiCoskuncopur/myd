import * as yup from 'yup';

import { messages } from '@/constants';

const { ADDRESS, CITY, COMPANY, DISTRICT, EMAIL, FIRSTNAME, LASTNAME, PASSWORD, PHONE, POSTALCODE, TOKEN } = messages;

export default yup.object({
  email: yup.string().typeError(EMAIL.TYPE).email(EMAIL.INVALID).required(EMAIL.REQUIRED),
  password: yup.string().typeError(PASSWORD.TYPE).min(8, PASSWORD.MIN).max(255, PASSWORD.MAX).required(PASSWORD.REQUIRED),
  firstName: yup.string().typeError(FIRSTNAME.TYPE).min(2, FIRSTNAME.MIN).max(75, FIRSTNAME.MAX).required(FIRSTNAME.REQUIRED),
  lastName: yup.string().typeError(LASTNAME.TYPE).min(2, LASTNAME.MIN).max(75, LASTNAME.MAX).required(LASTNAME.REQUIRED),
  company: yup.string().typeError(COMPANY.TYPE).min(5, COMPANY.MIN).max(75, COMPANY.MAX),
  phone: yup.string().typeError(PHONE.TYPE).length(10, PHONE.LENGTH).required(PHONE.REQUIRED),
  address: yup.object({
    line1: yup.string().typeError(ADDRESS.TYPE).min(5, ADDRESS.MIN).max(255, ADDRESS.MAX).required(ADDRESS.REQUIRED),
    line2: yup.string().typeError(ADDRESS.TYPE).max(255, ADDRESS.MAX),
    district: yup.string().typeError(DISTRICT.TYPE).min(2, DISTRICT.MIN).max(25, DISTRICT.MAX).required(DISTRICT.REQUIRED),
    city: yup.string().typeError(CITY.TYPE).min(2, CITY.MIN).max(35, CITY.MAX).required(CITY.REQUIRED),
    postalCode: yup.string().typeError(POSTALCODE.TYPE).length(5, POSTALCODE.LENGTH).required(POSTALCODE.REQUIRED),
  }),
  recaptchaToken: yup.string().typeError(TOKEN.TYPE).required(TOKEN.REQUIRED),
});
