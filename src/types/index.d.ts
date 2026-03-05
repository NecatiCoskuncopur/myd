interface JwtPayload {
  userId: string;
  role: UserRole;
}

interface CurrentUser {
  id: string;
  role: UserRole;
  email: string;
}

interface IPaginationParams {
  page?: number;
  limit?: number;
}

interface IPaginationResponse {
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
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

interface IPrice {
  weight?: number;
  price?: number;
}

interface IZone {
  number: number;
  prices: IPrice[];
  than?: number;
}

interface IPricingList {
  _id: string;
  name: string;
  zone: IZone[];
  createdAt: string;
  updatedAt: string;
}

interface IUserTransaction {
  transactionType: 'PAY' | 'SPEND';
  amount?: number;
  shippingId?: string;
  note?: string;
  createdAt: Date;
}

interface IUserBalanceData extends IPaginationResponse {
  balanceId: string;
  userId: string;
  total?: number;
  transactions: IUserTransaction[];
}

interface IShippingStatsParams {
  type: 'monthly' | 'yearly';
}

interface IShippingStats {
  keys: string[];
  datas: number[];
}

interface IAddTransactionUserBalancePayload {
  userId: string;
  amount: number;
  type: 'PAY' | 'SPEND';
  note?: string;
}

interface ICreatePricingListPayload {
  name: string;
  zone: {
    number: number;
    prices: {
      weight: number;
      price: number;
    }[];
    than: number;
  }[];
}

interface IPricingListsParams extends IPaginationParams {
  name?: string;
}

interface IPricingListData extends IPaginationResponse {
  pricingLists: IPricingList[];
}

interface IUpdatePricingListPayload extends ICreatePricingListPayload {
  pricingListId: string;
}

interface ISetUserPayload extends IEditUserPayload {
  userId: string;
  priceListId: string;
  role: 'CUSTOMER' | 'ADMIN' | 'OPERATOR';
  isActive: boolean;
  barcodePermits: string[];
}

interface ISearchSenderResult {
  _id: string;
  firstName?: string;
  lastName?: string;
  company?: string;
}
