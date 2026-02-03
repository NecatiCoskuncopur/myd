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

interface ISignUpForm extends ISignInForm {
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
