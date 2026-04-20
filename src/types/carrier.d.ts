declare namespace CarrierTypes {
  interface ICarrierServiceLabel {
    shippingInstance: {
      shipper: {
        name: string;
        address: string;
        city: string;
        postalCode: string;
        countryCode: string;
      };
      recipient: {
        name: string;
        address: string;
        city: string;
        postalCode: string;
        countryCode: string;
      };
      package: {
        weight: number;
        unit: 'KG' | 'LB';
      };
    };
    accountNumber: string;
  }

  interface ICreateFedexLabelParams extends ICarrierServiceLabel {
    credentials: {
      apiKey: string;
      secretKey: string;
    };
  }

  interface ICreateUpsLabelParams extends ICarrierServiceLabel {
    credentials: {
      clientId: string;
      clientSecret: string;
    };
  }
}
