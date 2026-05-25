declare namespace SummaryTypes {
  interface ITransactionStats {
    pay: number;
    spend: number;
    total: number;
  }

  interface IBalanceStats {
    daily: ITransactionStats;
    monthly: ITransactionStats;
    yearly: ITransactionStats;
  }
}
