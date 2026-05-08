declare namespace AuthTypes {
  interface ISignInPayload {
    email: string;
    password: string;
    recaptchaToken: string;
  }

  interface ISignInResponse {
    role: string;
    barcodePermits: number;
  }

  interface IForgotPasswordPayload {
    email: string;
    recaptchaToken: string;
  }

  interface IResetPasswordPayload {
    newPassword: string;
    token: string;
  }

  interface ISignUpPayload {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    recaptchaToken: string;
    company?: string;
    phone: string;
    address: UserTypes.Address;
  }

  interface IResetPasswordForm extends IResetPasswordPayload {
    newPasswordRepeat: string;
  }
}
