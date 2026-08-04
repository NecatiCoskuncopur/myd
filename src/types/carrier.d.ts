import { CarrierAccountTypes } from '@/types/carrierAccount';

declare namespace CarrierTypes {
  interface ICreatePaper {
    shippingInstance: ShippingTypes.IShipping;
    hasCustomInfo: boolean;
    customInfo?: CarrierAccountTypes.ICustomInfo;
    shippingId: string;
    accountNumber: string;
  }

  interface ICarrierDriverParams {
    shippingInstance: ShippingTypes.IShipping;
    accountNumber: string;
    hasCustomInfo: boolean;
    customInfo?: CarrierAccountTypes.ICustomInfo;
    credentials: {
      apiKey: string;
      secretKey: string;
    };
    shippingId: string;
  }

  interface ICreateFedexPaper extends ICreatePaper {
    credentials: {
      apiKey: string;
      secretKey: string;
    };
  }

  interface ICreateUpsPaper extends ICreatePaper {
    credentials: {
      apiKey: string;
      secretKey: string;
    };
  }

  interface ICreateQuickShipperPaper extends ICreatePaper {
    credentials: {
      apiKey: string;
      secretKey: string;
    };
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
