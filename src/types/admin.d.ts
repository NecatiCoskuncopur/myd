import { Types } from 'mongoose';

declare namespace AdminTypes {
  interface IAddTransactionUserBalancePayload {
    userId: string;
    amount: number;
    type: 'PAY' | 'SPEND';
    note?: string;
  }

  interface IUsersData extends ResponseTypes.IPaginationResponse {
    users: UserTypes.IUserWithPopulatedBalance[];
  }

  interface IListAllUsersParams extends ParamsTypes.IPaginationParams {
    balanceSorting?: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    phone?: string;
    email?: string;
  }

  interface ISetUserPayload {
    email: string;
    firstName: string;
    lastName: string;
    company?: string;
    taxId?: string;
    taxOffice?: string;
    phone: string;
    nickname?: string;
    address: UserTypes.IAddress;
    userId: string;
    priceListId: string;
    role: 'CUSTOMER' | 'ADMIN' | 'OPERATOR';
    isActive: boolean;
    barcodePermits: string[];
  }

  interface ISearchSenderUserParams {
    firstName?: string;
    lastName?: string;
    company?: string;
  }

  interface ISearchSenderResult extends ISearchSenderUserParams {
    _id: string;
  }

  interface ICreateUser {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    company?: string;
    taxId?: string;
    taxOffice?: string;
    phone: string;
    nickname?: string;
    address: UserTypes.IAddress;
  }

  interface IUpdatePackageDimensionsPayload {
    shippingId: string;
    weight: number;
    numberOfPackage: number;
    width: number;
    height: number;
    length: number;
    volumetricWeight?: number;
  }
}
