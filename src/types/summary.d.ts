declare namespace SummaryTypes {
  interface ITransactionStats {
    pay: number;
    spend: number;
    total: number;
  }

  interface IHeatMap {
    [countryCode: string]: number;
  }
}
