import * as yup from 'yup';

import messages from '@/lib/messages';

export default yup.object({
  currentPassword: yup.string().typeError(messages.CP02).min(8, messages.CP03).max(255, messages.CP04).required(messages.CP05),
  newPassword: yup.string().typeError(messages.CP06).min(8, messages.CP07).max(255, messages.CP08).required(messages.CP09),
});
