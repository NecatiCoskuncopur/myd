declare namespace ShippingTypes {
  interface ICalculateShippingPayload {
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
    address: ISenderAddress;
  }

  interface IConsignee {
    name: string;
    company: string;
    phone?: string;
    email?: string;
    taxId?: string;
    address: IConsigneeAddress;
  }

  interface IShippingDetail {
    payor: {
      shipping: 'SENDER' | 'CONSIGNEE';
      customs: 'SENDER' | 'CONSIGNEE';
    };
    iossNumber?: string;
    purpose: 'GIFT' | 'PERSONAL' | 'SAMPLE' | 'REPAIR_OR_RETURN' | 'COMMERCIAL';
  }

  interface IProduct {
    name: string;
    unitPrice: number;
    piece: number;
    gtip?: string;
  }

  interface IShippingContent {
    currency: 'USD' | 'EUR' | 'GBP';
    description?: string;
    freight?: number;
    products: IProduct[];
  }

  interface IPackage {
    weight: number;
    numberOfPackage: number;
    width: number;
    height: number;
    length: number;
    volumetricWeight: number;
  }

  interface IShipping {
    _id: string;
    userId: string;
    consigneeId: string;
    sender: ISender;
    consignee: IConsignee;
    detail: IShippingDetail;
    content: IShippingContent;
    package: IPackage;
    status?: 'CREATED' | 'LABELED' | 'CANCELED';
    carrier?: {
      name?: 'FEDEX' | 'TNT' | 'UPS';
      account?: string;
      trackingNumber?: string;
      amount?: number;
    };
    labelLink?: string;
    activities?: {
      userId?: string;
      type?: 'EDIT' | 'LABELING';
      data?: string;
    }[];
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
    senderId: string;
    consignee: IConsignee;
    detail: IShippingDetail;
    content: IShippingContent;
    package: IPackage;
  }

  interface IUpdateShippingPayload extends ICreateShippingPayload {
    shippingId: string;
  }
}
