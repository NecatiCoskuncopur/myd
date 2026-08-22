import { ITransaction } from '@/models/Balance.model';

declare namespace BalanceTypes {
  interface IUserBalanceData extends ResponseTypes.IPaginationResponse {
    balanceId: string;
    userId: string;
    total?: number;
    transactions: ISerializedTransaction[];
  }

  type ISerializedTransaction = Omit<ITransaction, 'shippingId' | 'createdAt'> & {
    shippingId?: string;
    createdAt: string;
  };

  type ISerializedBalance = Omit<IBalance, 'userId' | 'transactions'> & {
    _id: string;
    userId: string;
    transactions: ISerializedTransaction[];
  };
}
