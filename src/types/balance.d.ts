import { ShippingTypes } from '@/types/shipping';

declare namespace BalanceTypes {
  interface ISerializedTransaction {
    _id: string;
    userId: string;
    transactionType: TransactionType;
    amount: number;
    shippingId?: ShippingTypes.IShipping | null;
    note?: string | null;
    createdAt: string;
    updatedAt: string;
  }

  interface IUserBalanceData extends ResponseTypes.IPaginationResponse {
    userId: string;
    total: number;
    transactions: ISerializedTransaction[];
  }

  type ISerializedBalance = Omit<IBalance, 'userId' | 'transactions'> & {
    _id: string;
    userId: string;
    transactions: ISerializedTransaction[];
  };
}
