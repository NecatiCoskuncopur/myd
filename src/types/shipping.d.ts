import { Carrier, CarrierAccountTypeEnum, CurrencyEnum, ShippingActivities, ShippingPayor, ShippingPurpose, ShippingStatus } from '@/constants';
import { CarrierAccountTypes } from '@/types/carrierAccount';

declare namespace ShippingTypes {
  interface ICalculateShippingPayload {
    serviceType: CarrierAccountTypeEnum;
    weight: number;
    countryCode: string;
  }

  interface IBaseAddress {
    line1: string;
    line2?: string;
    city: string;
    postalCode: string;
  }

  interface ISenderAddress extends IBaseAddress {
    district: string;
  }

  interface IConsigneeAddress extends IBaseAddress {
    country: string;
    state?: string;
  }

  interface ISender {
    name: string;
    company?: string;
    phone: string;
    email: string;
    nickname?: string;
    address: ISenderAddress;
  }

  interface IConsignee {
    _id: string;
    name: string;
    company?: string;
    phone?: string;
    email?: string;
    taxId?: string;
    address: IConsigneeAddress;
  }

  interface IShippingDetail {
    payor: {
      customs: ShippingPayor;
    };
    iossNumber?: string;
    purpose: ShippingPurpose;
  }

  interface IProduct {
    name: string;
    unitPrice: number;
    piece: number;
    gtip?: string;
  }

  interface IShippingContent {
    currency: CurrencyEnum;
    description?: string;
    freight?: number;
    insurance?: boolean;
    insuranceAmount?: number;
    products: IProduct[];
  }

  interface IPackage {
    weight: number;
    numberOfPackage: number;
    width: number;
    height: number;
    length: number;
    volumetricWeight?: number;
  }

  interface ICarrier {
    name: Carrier;
    displayName: string;
    account?: string;
    accountType?: CarrierAccountTypeEnum;
    trackingNumber?: string;
    amount?: number;
    costs?: number;
    insuranceCost?: number;
    dutiesAndTaxesCost?: number;
  }

  interface IActivity {
    userId: string;
    type: ShippingActivities;
    data?: string;
  }

  interface IShipping {
    _id: string;
    userId?: string;
    consigneeId?: string;
    sender: ISender;
    consignee: IConsignee;
    detail: IShippingDetail;
    content: IShippingContent;
    package: IPackage;
    packageDimensionsUpdated: boolean;
    status: ShippingStatus;
    carrier?: ICarrier;
    labelLink?: string;
    activities?: IActivity[];
    labeledAt?: Date;
    createdAt: string;
    updatedAt: string;
  }

  interface IShippingData extends ResponseTypes.IPaginationResponse {
    shippings: IShipping[];
  }

  interface IShippingExcel {
    fileName: string;
    content: string;
  }

  interface IListShippingParams extends ParamsTypes.IPaginationParams {
    senderName?: string;
    consigneeName?: string;
    consigneeCompany?: string;
    consigneePhone?: string;
    download?: boolean;
    trackingNumber?: string;
    startDate?: string;
    endDate?: string;
  }

  interface ICreateShippingPayload {
    sender: ISender;
    consignee: IConsignee;
    detail: IShippingDetail;
    content: IShippingContent;
    package: IPackage;
  }

  interface ICreateShippingFormPayload extends ICreateShippingPayload {
    senderId: string;
  }

  interface IUpdateShippingPayload extends ICreateShippingPayload {
    shippingId: string;
  }

  interface ICreateBarcodeParams {
    shippingId: string;
    firm: Carrier;
    displayName: string;
    hasCustomInfo: boolean;
    customInfo?: CarrierAccountTypes.ICustomInfo;
    accountNumber: string;
    carrierAccountId: string;
  }

  interface IGetPaperParams {
    shippingId: string;
    type: 'labels' | 'invoices';
  }
}
