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
}
