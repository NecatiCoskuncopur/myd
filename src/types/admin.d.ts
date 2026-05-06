declare namespace AdminTypes {
  interface IAddTransactionUserBalancePayload {
    userId: string;
    amount: number;
    type: 'PAY' | 'SPEND';
    note?: string;
  }
}
