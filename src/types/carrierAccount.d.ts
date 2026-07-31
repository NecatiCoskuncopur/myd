import { Carrier } from '@/constants';

declare namespace CarrierAccountTypes {
  export interface ICarrierCredential {
    key: string;
    value: string;
  }
  interface ICarrierAccount {
    _id: string;
    name: string;
    carrier: Carrier;
    accountNumber: string;
    isActive: boolean;
    credentials: ICarrierCredential[];
    meta?: Record<string, string>;
    createdAt: string;
    updatedAt: string;
  }

  interface ICreateCarrierAccountPayload {
    name: string;
    carrier: Carrier;
    accountNumber: string;
    credentials: ICarrierCredential[];
    meta?: Record<string, string>;
  }

  interface ICarrierAccountData extends ResponseTypes.IPaginationResponse {
    carrierAccounts: ICarrierAccount[];
  }

  interface ICarrierAccountsParams extends ParamsTypes.IPaginationParams {
    name?: string;
    carrier?: Carrier;
    accountNumber?: string;
    isActive?: boolean;
  }

  interface IUpdateCarrierAccountPayload extends Partial<ICreateCarrierAccountPayload> {
    id: string;
    isActive?: boolean;
  }
}
