import { UserRole, CarrierAccountTypeEnum } from '@/constants';
import { IUser } from '@/models/User.model';

declare namespace UserTypes {
  interface JwtPayload {
    sub: string;
    role: 'CUSTOMER' | 'OPERATOR' | 'ADMIN';
  }

  interface ICurrentUser {
    id: string;
    role: UserRole;
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

  interface IUserPriceList {
    serviceType: CarrierAccountTypeEnum;
    priceListId: string;
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

    pricingLists?: {
      serviceType: CarrierAccountTypeEnum;
      priceList: {
        _id: string;
        name: string;
      };
    }[];
  }

  interface IEditUserPayload {
    email: string;
    firstName: string;
    lastName: string;
    company: string;
    taxId: string;
    taxOffice: string;
    nickname: string;
    phone: string;
    address;
  }

  interface UserDto {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    company?: string;
    taxId?: string;
    taxOffice?: string;
    nickname?: string;
    phone: string;
    role: UserRole;
    isActive: boolean;
    barcodePermits: string[];
    address: IUser['address'];
    priceLists: IUserPriceList[];
    createdAt: Date;
    updatedAt: Date;
  }
}
