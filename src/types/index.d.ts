interface JwtPayload {
  userId: string;
  role: UserRole;
}

interface CurrentUser {
  id: string;
  role: UserRole;
  email: string;
}

interface IUserRole {
  role: 'CUSTOMER' | 'OPERATOR' | 'ADMIN';
}
