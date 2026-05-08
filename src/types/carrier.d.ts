declare namespace CarrierTypes {
  interface ICreateFedexLabelParams {
    shippingInstance: {
      shipper: {
        name: string;
        address: string;
        city: string;
        postalCode: string;
        countryCode: string;
        phoneNumber: string;
      };
      recipient: {
        name: string;
        address: string;
        city: string;
        stateCode?: string;
        postalCode: string;
        countryCode: string;
        phoneNumber: string;
        stateOrProvinceCode?: string;
      };
      detail: ShippingTypes.IShippingDetail;
      content: ShippingTypes.IShippingContent;
      package: ShippingTypes.IPackage;
    };
    accountNumber: string;
    credentials: {
      apiKey: string;
      secretKey: string;
    };
  }
}
