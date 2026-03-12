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

interface IUserWithPopulatedBalance extends IUser {
  balance: IUserBalanceData;
  pricingList?: { _id: string; name: string };
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
  search?: string;
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

interface IListAllUsersParams extends IPaginationParams {
  balanceSorting?: string;
  search?: string;
}

interface IUsersData extends IPaginationResponse {
  users: IUserWithPopulatedBalance[];
}

interface IManualLabelPayload {
  id: string;
  firm: string;
  trackingNumber: string;
}

interface IShipping {
  _id: string;
  userId: string;
  consigneeId: string;
  sender: {
    name?: string;
    company?: string;
    phone?: string;
    email?: string;
    address?: {
      line1?: string;
      line2?: string;
      district?: string;
      postalCode?: string;
      city?: string;
    };
  };
  consignee: {
    name?: string;
    company?: string;
    phone?: string;
    email?: string;
    taxId?: string;
    address?: {
      line1?: string;
      line2?: string;
      country?: string;
      state?: string;
      city?: string;
      postalCode?: string;
    };
  };
  detail?: {
    payor?: {
      shipping?: 'SENDER' | 'CONSIGNEE';
      customs?: 'SENDER' | 'CONSIGNEE';
    };
    iossNumber?: string;
    purpose?: 'GIFT' | 'PERSONAL' | 'SAMPLE' | 'REPAIR_OR_RETURN' | 'COMMERICAL';
  };
  content?: {
    currency?: 'USD' | 'EUR' | 'GBP';
    description?: string;
    freight?: number;
    products?: {
      name?: string;
      unitPrice?: number;
      piece?: number;
      gtip?: string;
    }[];
  };
  package?: {
    weight?: number;
    numberOfPackage?: number;
    width?: number;
    height?: number;
    length?: number;
  };
  status?: 'CREATED' | 'LABELED' | 'CANCELED';
  carrier?: {
    name?: 'FEDEX' | 'TNT' | 'UPS';
    account?: string;
    trackingNumber?: string;
    amount?: number;
  };
  labelLink?: string;
  activities?: {
    userId?: string;
    type?: 'EDIT' | 'LABELING';
    data?: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

interface IListShippingParams extends IPaginationParams {
  senderName?: string;
  consigneeName?: string;
  consigneeCompany?: string;
  consigneePhone?: string;
  download?: boolean;
  trackingNumber?: string;
  startDate?: string;
  endDate?: string;
}

interface IShippingData extends IPaginationResponse {
  shippings: IShipping[];
}

interface IShippingExcel {
  fileName: string;
  content: string;
}

interface IShippingMatch {
  'sender.name'?: { $regex: string; $options: 'i' };
  'consignee.name'?: { $regex: string; $options: 'i' };
  'consignee.company'?: { $regex: string; $options: 'i' };
  'consignee.phone'?: { $regex: string; $options: 'i' };
  'carrier.trackingNumber'?: { $regex: string; $options: 'i' };
  createdAt?: { $gte: Date; $lte: Date };
}

interface ICalculateShippingPayload {
  weight: number;
  countryCode: string;
}

interface ICreateShippingPayload {
  senderId: string;
  consignee: {
    _id: Types.ObjectId;
    name: string;
    company?: string;
    phone?: string;
    email?: string;
    taxId?: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      country: string;
      state?: string;
      postalCode: string;
    };
  };

  detail: {
    payor: {
      shipping: 'SENDER' | 'CONSIGNEE';
      customs: 'SENDER' | 'CONSIGNEE';
    };
    iossNumber?: string;
    purpose: 'GIFT' | 'PERSONAL' | 'SAMPLE' | 'REPAIR_OR_RETURN' | 'COMMERICAL';
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

interface IUpdateShippingPayload extends ICreateShippingPayload {
  shippingId: string;
}

interface IGetPaperParams {
  shippingId: string;
  type: 'labels' | 'invoices';
}

interface ICreateBarcodeParams {
  shippingId: string;
  firm: 'UPS' | 'FEDEX';
  accountNumber: string;
}

interface ICarrierCredential {
  key: string;
  value: string;
}

interface IConsigneeParams extends IPaginationParams {
  name: string;
}

interface IConsignee {
  _id: string;
  userId: string;
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

interface IResetPasswordForm {
  newPassword: string;
  newPasswordRepeat: string;
}

interface ISidebarItem {
  key: string;
  label: string;
  icon?: ReactNode;
  path?: string;
  external?: boolean;
  action?: () => void;
  children?: ISidebarItem[];
}
