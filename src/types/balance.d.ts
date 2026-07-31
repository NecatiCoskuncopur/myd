import { ITransaction } from '@/models/Balance.model';

declare namespace BalanceTypes {
  interface IUserBalanceData extends ResponseTypes.IPaginationResponse {
    balanceId: string;
    userId: string;
    total?: number;
    transactions: ITransaction[];
  }
}
