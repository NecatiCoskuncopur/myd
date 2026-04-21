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
}
