declare namespace CarrierAccountTypes {
  interface ICarrierCredential {
    key: string;
    value: string;
  }

  interface ICreateCarrierAccountPayload {
    name: string;
    carrier: 'FEDEX' | 'UPS';
    accountNumber: string;
    credentials: ICarrierCredential[];
    meta?: Record<string, unknown>;
  }

  interface IUpdateCarrierAccountPayload extends Partial<ICreateCarrierAccountPayload> {
    id: string;
    isActive?: boolean;
  }

  export interface ICarrierAccount {
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
