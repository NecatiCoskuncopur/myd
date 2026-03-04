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
