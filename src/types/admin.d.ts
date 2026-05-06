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
}
