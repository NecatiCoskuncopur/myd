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
