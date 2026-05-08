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
    phone: string;
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
}
