import { CarrierAccountTypeEnum } from '@/constants';

declare namespace PricingListTypes {
  interface IPrice {
    weight: number;
    price: number;
  }

  interface IZone {
    number: number;
    prices: IPrice[];
    than: number;
  }

  interface IPricingList {
    _id: string;
    name: string;
    listType: CarrierAccountTypeEnum;
    zone: IZone[];
    createdAt: string;
    updatedAt: string;
  }

  interface ICreatePricingListPayload {
    name: string;
    listType: CarrierAccountTypeEnum;
    zone: IZone[];
  }

  interface IPricingListsParams extends ParamsTypes.IPaginationParams {
    name?: string;
    listType?: CarrierAccountTypeEnum;
  }

  interface IPricingListData extends ResponseTypes.IPaginationResponse {
    pricingLists: IPricingList[];
  }

  interface IUpdatePricingListPayload extends ICreatePricingListPayload {
    pricingListId: string;
  }
}
