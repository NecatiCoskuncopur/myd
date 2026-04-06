declare namespace BalanceTypes {
  interface IUserTransaction {
    transactionType: 'PAY' | 'SPEND';
    amount?: number;
    shippingId?: string;
    note?: string;
    createdAt: Date;
  }

  interface IUserBalanceData extends ResponseTypes.IPaginationResponse {
    balanceId: string;
    userId: string;
    total?: number;
    transactions: IUserTransaction[];
  }
}
