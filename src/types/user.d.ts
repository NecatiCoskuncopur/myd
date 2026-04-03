declare namespace UserTypes {
  interface JwtPayload {
    sub: string;
    role: 'CUSTOMER' | 'OPERATOR' | 'ADMIN';
  }

  interface ICurrentUser {
    id: string;
    role: 'CUSTOMER' | 'OPERATOR' | 'ADMIN';
    email: string;
  }
}
