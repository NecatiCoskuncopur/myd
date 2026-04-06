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
    };
  }

  interface IUpdateShippingPayload extends ICreateShippingPayload {
    shippingId: string;
  }
}
