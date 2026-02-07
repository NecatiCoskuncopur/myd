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

interface IShippingStats {
  keys: string[];
  datas: number[];
}

interface IUserBalanceParams {
  page?: number;
  limit?: number;
}

interface IListShippingParams {
  page?: number;
  pageSize?: number;
  senderName?: string;
  consigneeName?: string;
  consigneeCompany?: string;
  consigneePhone?: string;
  trackingNumber?: string;
  startDate?: string;
  endDate?: string;
}

interface IConsigneeInput {
  _id?: string;
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  taxId?: string;
  address: {
    line1: string;
    line2?: string;
    country: string;
    state?: string;
    city: string;
    postalCode: string;
  };
}

interface ICreateShippingForm {
  senderId?: string;
  consignee: IConsigneeInput;
  detail: {
    payor: {
      shipping: 'SENDER' | 'CONSIGNEE';
      customs: 'SENDER' | 'CONSIGNEE';
    };
    iossNumber?: string;
    purpose: 'GIFT' | 'PERSONAL' | 'SAMPLE' | 'REPAIR_OR_RETURN' | 'COMMERCIAL';
  };

  content: {
    currency: 'USD' | 'EUR' | 'GBP';
    description?: string;
    freight?: number;
    products: Array<{
      name: string;
      piece: number;
      unitPrice: number;
      harmonizedCode?: string;
    }>;
  };

  package: {
    weight: number;
    numberOfPackage: number;
    width: number;
    height: number;
    length: number;
  };
}
