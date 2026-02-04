import * as yup from 'yup';

import messages from '@/lib/messages';

export default yup.object({
  email: yup.string().typeError(messages.CU1).email(messages.CU12).required(messages.CU33),
  firstName: yup.string().typeError(messages.CU3).min(2, messages.CU14).max(75, messages.CU24).required(messages.CU35),
  lastName: yup.string().typeError(messages.CU4).min(2, messages.CU15).max(75, messages.CU25).required(messages.CU36),
  company: yup.string().typeError(messages.CU5).min(5, messages.CU16).max(75, messages.CU26),
  phone: yup.string().typeError(messages.CU6).min(10, messages.CU17).max(35, messages.CU27).required(messages.CU42),
  address: yup.object().shape({
    line1: yup.string().typeError(messages.CU9).min(5, messages.CU19).max(35, messages.CU29).required(messages.CU37),
    line2: yup.string().typeError(messages.CU9).max(35, messages.CU29),
    district: yup.string().typeError(messages.CU10).min(2, messages.CU20).max(25, messages.CU30).required(messages.CU38),
    city: yup.string().typeError(messages.CU11).min(2, messages.CU21).max(25, messages.CU31).required(messages.CU39),
    postalCode: yup.string().typeError(messages.CU12).min(4, messages.CU22).max(10, messages.CU32).required(messages.CU40),
  }),
});
