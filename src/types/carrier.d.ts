declare namespace CarrierTypes {
  interface ICreatePaper {
    shippingInstance: ShippingTypes.IShipping;
    shippingId: string;
    accountNumber: string;
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
}
