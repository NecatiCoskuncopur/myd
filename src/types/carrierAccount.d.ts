import { Carrier, CarrierAccountTypeEnum } from '@/constants';

declare namespace CarrierAccountTypes {
  export interface ICarrierCredential {
    key: string;
    value: string;
  }

  interface ICarrierAddress {
    line1: string;
    line2?: string;
    city: string;
    postalCode: string;
    district: string;
  }

  interface ICustomInfo {
    email: string;
    firstName: string;
    lastName: string;
    company: string;
    phone: string;
    address?: ICarrierAddress;
  }

  interface IPrice {
    weight: number;
    price: number;
  }

  interface IZone {
    number: number;
    prices: IPrice[];
    than: number;
  }

  interface IPricing {
    zones: IZone[];
  }

  interface ICarrierAccount {
    _id: string;
    name: string;
    displayName: string;
    carrier: Carrier;
    accountType: CarrierAccountTypeEnum;
    accountNumber: string;
    isActive: boolean;
    credentials: ICarrierCredential[];
    pricing: IPricing;
    hasCustomInfo: boolean;
    customInfo?: ICustomInfo;
    meta?: Record<string, string>;
    createdAt: string;
    updatedAt: string;
  }

  interface ICreateCarrierAccountPayload {
    name: string;
    displayName: string;
    carrier: Carrier;
    accountType: CarrierAccountTypeEnum;
    accountNumber: string;
    pricing: IPricing;
    credentials: ICarrierCredential[];
    hasCustomInfo: boolean;
    customInfo?: ICustomInfo;
    meta?: Record<string, string>;
  }

  interface ICarrierAccountData extends ResponseTypes.IPaginationResponse {
    carrierAccounts: ICarrierAccount[];
  }

  interface ICarrierAccountsParams extends ParamsTypes.IPaginationParams {
    name?: string;
    displayName?: string;
    accountType?: CarrierAccountTypeEnum;
    carrier?: Carrier;
    accountNumber?: string;
    isActive?: boolean;
  }

  interface IUpdateCarrierAccountPayload extends Partial<ICreateCarrierAccountPayload> {
    id: string;
    isActive?: boolean;
  }

  interface ICarrierErrorResponse {
    errors?: Array<{
      code?: string;
      message?: string;
      parameterList?: Array<{
        parameter: string;
        value: string;
      }>;
    }>;
  }
}
