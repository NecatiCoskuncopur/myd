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
}
