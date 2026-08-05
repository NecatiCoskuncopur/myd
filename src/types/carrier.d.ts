import { CarrierAccountTypes } from '@/types/carrierAccount';

declare namespace CarrierTypes {
  interface ICreatePaper {
    shippingInstance: ShippingTypes.IShipping;
    hasCustomInfo: boolean;
    customInfo?: CarrierAccountTypes.ICustomInfo;
    shippingId: string;
    credentials: Record<string, string>;
    accountNumber: string;
  }

  interface ICarrierDriverParams {
    shippingInstance: ShippingTypes.IShipping;
    accountNumber: string;
    hasCustomInfo: boolean;
    customInfo?: CarrierAccountTypes.ICustomInfo;
    credentials: Record<string, string>;
    shippingId: string;
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
