interface IActionResponse<T = undefined> {
  status: 'OK' | 'ERROR';
  data?: T;
  message?: string;
}

interface IForgotPasswordPayload {
  email: string;
}

interface IResetPasswordPayload {
  newPassword: string;
  token: string;
}

interface ISignInPayload {
  email: string;
  password: string;
  recaptchaToken: string;
}

interface ISignInResponse {
  role: string;
  barcodePermits: number;
}

interface ISignUpPayload {
  email: string;
  password: string;
  recaptchaToken: string;
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
