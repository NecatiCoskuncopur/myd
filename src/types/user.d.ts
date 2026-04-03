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
    createdAt: Date;
    updatedAt: Date;
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
}
