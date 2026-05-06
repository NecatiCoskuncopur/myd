declare namespace CarrierAccountTypes {
  interface ICarrierCredential {
    key: string;
    value: string;
  }

  interface ICarrierAccount {
    _id: string;
    name: string;
    carrier: 'FEDEX' | 'UPS';
    accountNumber: string;
    isActive: boolean;
    credentials: ICarrierCredential[];
    meta?: Record<string, unknown>;
    createdAt?: string | Date;
    updatedAt?: string | Date;
  }

  interface ICreateCarrierAccountPayload {
    name: string;
    carrier: 'FEDEX' | 'UPS';
    accountNumber: string;
    credentials: ICarrierCredential[];
    meta?: Record<string, unknown>;
  }

  interface ICarrierAccountData extends ResponseTypes.IPaginationResponse {
    carrierAccounts: ICarrierAccount[];
  }

  interface ICarrierAcccountsParams extends ParamsTypes.IPaginationParams {
    name?: string;
    carrier?: 'FEDEX' | 'UPS';
    accountNumber?: string;
    isActive?: boolean;
  }
}
