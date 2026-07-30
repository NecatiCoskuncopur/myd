import { UserRole } from '@/constants';
import { IUser } from '@/models/User.model';

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

  interface IUserWithPopulatedBalance extends Omit<UserDto, 'balance'> {
    balance: {
      _id: string;
      total: number;
    };
    pricingList?: {
      _id: string;
      name: string;
    };
  }

  interface IEditUserPayload extends Pick<UserDto, 'email' | 'firstName' | 'lastName' | 'company' | 'phone' | 'address'> {}

  interface UserDto {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    company?: string;
    phone: string;
    role: UserRole;
    isActive: boolean;
    barcodePermits: string[];
    address: IUser['address'];
    priceListId?: string;
    createdAt: Date;
    updatedAt: Date;
  }
}
