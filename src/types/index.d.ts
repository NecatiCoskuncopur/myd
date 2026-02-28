//RESPONSE - PAGINATION
interface IActionResponse<T = undefined> {
  status: 'OK' | 'ERROR';
  data?: T;
  message?: string;
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

//SIDEBAR
interface ISidebarItem {
  key: string;
  label: string;
  icon?: ReactNode;
  path?: string;
  external?: boolean;
  action?: () => void;
  children?: ISidebarItem[];
}

//AUTH
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

// CONSIGNEE

interface IConsigneeParams extends IPaginationParams {
  name: string;
}

interface IConsignee {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  company?: string;
  phone?: string;
  email?: string;
  identityNumber?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    postalCode?: string;
    state?: string;
    country?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

interface IConsigneeData extends IPaginationResponse {
  consignees: IConsignee[];
}

//USER

interface IChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

interface IChangePasswordFormUI extends IChangePasswordPayload {
  newPasswordRepeat: string;
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
  balance: IUserBalance;
  createdAt: Date;
  updatedAt: Date;
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

interface IPricingPrice {
  weight?: number;
  price?: number;
}

interface IPricingZone {
  number: number;
  than?: number;
  prices: IPricingPrice[];
}

interface IUserPricingListData extends IPaginationResponse {
  pricingListId: string;
  name: string;
  zones: IPricingZone[];
  createdAt: Date;
  updatedAt: Date;
}

interface ShippingStatsParams {
  type: 'monthly' | 'yearly';
}

interface IShippingStats {
  keys: string[];
  datas: number[];
}

//ADMIN
interface IAddTransactionUserBalance {
  userId: string;
  amount: number;
  type: 'PAY' | 'SPEND';
  note?: string;
}

interface IListAllUsersParams extends IPaginationParams {
  balanceSorting?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  email?: string;
}

interface IUsersData extends IPaginationResponse {
  users: IUser[];
}

interface ISetUserPayload extends IEditUserPayload {
  userId: string;
  priceListId: string;
  role: 'CUSTOMER' | 'ADMIN' | 'OPERATOR';
  isActive: boolean;
  barcodePermits: string[];
}

interface IPricingList {
  _id: string;
  name: string;
  zone: {
    number: number;
    prices: {
      weight?: number;
      price?: number;
    }[];
    than?: number;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}
