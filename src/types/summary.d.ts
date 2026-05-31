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

  interface IGetTopFiveCountry {
    country: string;
    totalShippings: number;
    value: number;
  }

  interface IGetTopFiveUser {
    name: string;
    surname: string;
    value: number;
  }
}
