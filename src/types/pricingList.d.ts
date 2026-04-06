declare namespace PricingListTypes {
  interface IPrice {
    weight?: number;
    price?: number;
  }

  interface IZone {
    number: number;
    prices: IPrice[];
    than?: number;
  }

  interface IPricingList {
    _id: string;
    name: string;
    zone: IZone[];
    createdAt: string;
    updatedAt: string;
  }

  interface IPricingListsParams extends ParamsTypes.IPaginationParams {
    name?: string;
  }

  interface IPricingListData extends ResponseTypes.IPaginationResponse {
    pricingLists: IPricingList[];
  }
}
