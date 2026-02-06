// AUTH

interface IForgotPasswordForm {
  email: string;
}

interface ISignInForm extends IForgotPasswordForm {
  password: string;
  recaptchaToken: string;
}

interface IResetPasswordForm {
  newPassword: string;
  token: string;
}

interface IEditUserForm extends IForgotPasswordForm {
  firstName: string;
  lastName: string;
  company?: string;
  phone: string;
  address: {
    line1: string;
    line2?: string;
    district: string;
    city: string;
    postalCode: string;
  };
}

interface ISignUpForm extends IEditUserForm {
  password: string;
  recaptchaToken: string;
}

interface IChangePasswordForm {
  currentPassword: string;
  newPassword: string;
}

interface IHeatMap {
  country: string;
  value: number;
}
