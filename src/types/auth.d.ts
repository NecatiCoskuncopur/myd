declare namespace AuthTypes {
  interface ISignUpPayload {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    recaptchaToken: string;
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
}
