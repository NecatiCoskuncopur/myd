import { Document, Types } from 'mongoose';

declare namespace UserTypes {
  interface JwtPayload {
    sub: string;
    role: 'CUSTOMER' | 'OPERATOR' | 'ADMIN';
  }

  interface ICurrentUser {
    id: string;
    role: 'CUSTOMER' | 'OPERATOR' | 'ADMIN';
    email: string;
    barcodePermits: string[];
  }

  interface IAddress {
    line1: string;
    line2?: string;
    district: string;
    city: string;
    postalCode: string;
  }

  interface IUser extends Document {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    company?: string;
    phone: string;
    priceListId: Types.ObjectId;
    address: IAddress;
    role: 'CUSTOMER' | 'OPERATOR' | 'ADMIN';
    barcodePermits: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }

  interface ICleanUser {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    company?: string;
    phone: string;
    priceListId?: string;
    address: IAddress;
    role: 'CUSTOMER' | 'OPERATOR' | 'ADMIN';
    barcodePermits: string[];
    isActive: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
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

  interface IChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
  }

  interface IChangePasswordFormUI extends IChangePasswordPayload {
    newPasswordRepeat: string;
  }

  interface IEditUserPayload {
    email: string;
    firstName: string;
    lastName: string;
    company?: string;
    phone: string;
    address: IAddress;
  }

  interface IUserWithPopulatedBalance extends Omit<ICleanUser, 'balance'> {
    balance: {
      _id: string;
      total: number;
    };
    pricingList?: {
      _id: string;
      name: string;
    };
  }
}
