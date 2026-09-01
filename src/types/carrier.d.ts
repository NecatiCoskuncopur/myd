import { CarrierAccountTypeEnum } from '@/constants';
import { CarrierAccountTypes } from '@/types/carrierAccount';

declare namespace CarrierTypes {
  interface ICreatePaper {
    shippingInstance: ShippingTypes.IShipping;
    hasCustomInfo: boolean;
    customInfo?: CarrierAccountTypes.ICustomInfo;
    shippingId: string;
    credentials: Record<string, string>;
    accountNumber: string;
    accountType: CarrierAccountTypeEnum;
  }

  interface ICarrierTaxParams {
    credentials: Record<string, string>;
    shippingInstance: ShippingTypes.IShipping;
    accountType: CarrierAccountTypeEnum;
    cost: number;
  }

  interface ICarrierDriverParams {
    shippingInstance: ShippingTypes.IShipping;
    accountNumber: string;
    hasCustomInfo: boolean;
    customInfo?: CarrierAccountTypes.ICustomInfo;
    credentials: Record<string, string>;
    shippingId: string;
    accountType: CarrierAccountTypeEnum;
  }

  interface FedexPackageDocument {
    contentType?: string;
    documentType?: string;
    encodedLabel?: string;
    parts?: {
      image: string;
    }[];
  }
}
