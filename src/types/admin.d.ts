declare namespace AdminTypes {
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

  interface IAddTransactionUserBalancePayload {
    userId: string;
    amount: number;
    type: 'PAY' | 'SPEND';
    note?: string;
  }

  interface ISetUserPayload {
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

  interface ISearchSenderUserParams {
    firstName?: string;
    lastName?: string;
    company?: string;
  }
}
