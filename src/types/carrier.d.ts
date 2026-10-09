import { CarrierAccountTypeEnum, NavlungoFirmEnum } from '@/constants';
import { CarrierAccountTypes } from '@/types/carrierAccount';

declare namespace CarrierTypes {
  interface ICreatePaper {
    shippingInstance: ShippingTypes.IShipping;
    customInfo?: CarrierAccountTypes.ICustomInfo;
    shippingId: string;
    credentials: Record<string, string>;
    navlungoFirm?: NavlungoFirmEnum;
    accountNumber: string;
    accountType: CarrierAccountTypeEnum;
  }

  interface ITrackingParams {
    accountNumber: string;
    trackingNumber: string;
    credentials: Record<string, string>;
  }

  interface ICancelShippingParams {
    accountNumber: string;
    trackingNumber: string;
    credentials: Record<string, string>;
    carrierShipmentId?: string;
  }

  interface ICarrierDriverParams {
    shippingInstance: ShippingTypes.IShipping;
    accountNumber: string;
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

  interface IDocumentUploadError {
    documentId: string;
    message: string;
  }
}
