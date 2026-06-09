declare namespace SummaryTypes {
  interface ITransactionStats {
    pay: number;
    spend: number;
    total: number;
  }

  interface IHeatMap {
    [countryCode: string]: number;
  }
  interface IShippingStats {
    CREATED: number;
    LABELED: number;
    CANCELLED: number;
    TOTAL: number;
  }
}
