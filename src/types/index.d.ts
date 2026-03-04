interface JwtPayload {
  userId: string;
  role: UserRole;
}

interface CurrentUser {
  id: string;
  role: UserRole;
  email: string;
}

interface IUserRole {
  role: 'CUSTOMER' | 'OPERATOR' | 'ADMIN';
}

interface ICarrierServiceLabel {
  shippingInstance: {
    shipper: {
      name: string;
      address: string;
      city: string;
      postalCode: string;
      countryCode: string;
    };
    recipient: {
      name: string;
      address: string;
      city: string;
      postalCode: string;
      countryCode: string;
    };
    package: {
      weight: number;
      unit: 'KG' | 'LB';
    };
  };
  accountNumber: string;
}

interface ICreateFedexLabelParams extends ICarrierServiceLabel {
  credentials: {
    apiKey: string;
    secretKey: string;
  };
}

interface ICreateUpsLabelParams extends ICarrierServiceLabel {
  credentials: {
    clientId: string;
    clientSecret: string;
  };
}

interface IActionResponse<T = undefined> {
  status: 'OK' | 'ERROR';
  data?: T;
  message?: string;
}

interface ISignInResponse {
  role: string;
  barcodePermits: number;
}

interface ISignInPayload {
  email: string;
  password: string;
  recaptchaToken: string;
}

interface IEditUserPayload {
  email: string;
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

interface ISignUpPayload extends IEditUserPayload {
  password: string;
  recaptchaToken: string;
}

interface IForgotPasswordPayload {
  email: string;
}

interface IResetPasswordPayload {
  newPassword: string;
  token: string;
}

interface IChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

interface IUser {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  priceListId?: string;
  address?: {
    line1?: string;
    line2?: string;
    district?: string;
    postalCode?: string;
    city?: string;
  };
  role: 'CUSTOMER' | 'OPERATOR' | 'ADMIN';
  barcodePermits?: string[];
  isActive: boolean;
  balanceId: string;
  createdAt: Date;
  updatedAt: Date;
}
