import { Document, Types } from 'mongoose';

declare namespace UserTypes {
  interface IAddress {
    line1: string;
    line2?: string;
    district: string;
    city: string;
    postalCode: string;
  }

  interface IUser extends Document {
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    company?: string;
    phone: string;
    priceListId?: Types.ObjectId | string;
    address: IAddress;
    role: 'CUSTOMER' | 'OPERATOR' | 'ADMIN';
    barcodePermits: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
}
