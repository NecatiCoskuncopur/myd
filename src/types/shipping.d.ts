declare namespace ShippingTypes {
  interface ICalculateShippingPayload {
    weight: number;
    countryCode: string;
  }

  interface ICreateShippingPayload {
    senderId: string;
    consignee: {
      _id: string;
      name: string;
      company?: string;
      phone?: string;
      email?: string;
      taxId?: string;
      address: {
        line1: string;
        line2?: string;
        city: string;
        country: string;
        state?: string;
        postalCode: string;
      };
    };

    detail: {
      payor: {
        shipping: 'SENDER' | 'CONSIGNEE';
        customs: 'SENDER' | 'CONSIGNEE';
      };
      iossNumber?: string;
      purpose: 'GIFT' | 'PERSONAL' | 'SAMPLE' | 'REPAIR_OR_RETURN' | 'COMMERICAL';
    };

    content: {
      currency: 'USD' | 'EUR' | 'GBP';
      description?: string;
      freight?: number;
      products: Array<{
        name: string;
        piece: number;
        unitPrice: number;
        harmonizedCode?: string;
      }>;
    };

    package: {
      weight: number;
      numberOfPackage: number;
      width: number;
      height: number;
      length: number;
      volumetricWeight: number;
    };
  }

  interface IUpdateShippingPayload extends ICreateShippingPayload {
    shippingId: string;
  }

  interface ISender {
    name?: string;
    company?: string;
    phone?: string;
    email?: string;
    address?: {
      line1?: string;
      line2?: string;
      district?: string;
      postalCode?: string;
      city?: string;
    };
  }

  interface IConsignee {
    name?: string;
    company?: string;
    phone?: string;
    email?: string;
    taxId?: string;
    address?: {
      line1?: string;
      line2?: string;
      country?: string;
      state?: string;
      city?: string;
      postalCode?: string;
    };
  }

  interface IShippingDetail {
    payor?: {
      shipping?: 'SENDER' | 'CONSIGNEE';
      customs?: 'SENDER' | 'CONSIGNEE';
    };
    iossNumber?: string;
    purpose?: 'GIFT' | 'PERSONAL' | 'SAMPLE' | 'REPAIR_OR_RETURN' | 'COMMERICAL';
  }

  interface IShippingContent {
    currency?: 'USD' | 'EUR' | 'GBP';
    description?: string;
    freight?: number;
    products?: {
      name?: string;
      unitPrice?: number;
      piece?: number;
      gtip?: string;
    }[];
  }

  interface IPackage {
    weight?: number;
    numberOfPackage?: number;
    width?: number;
    height?: number;
    length?: number;
    volumetricWeight?: number;
  }

  interface IShipping {
    _id: string;
    userId: string;
    consigneeId: string;
    sender: ISender;
    consignee: IConsignee;
    detail?: IShippingDetail;
    content?: IShippingContent;
    package?: IPackage;
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
}
