import { IConsignee } from '@/models/Consignee.model';

declare namespace ConsigneeTypes {
  interface IConsigneeParams extends ParamsTypes.IPaginationParams {
    name: string;
  }
  export interface IConsigneeResponse extends IConsignee {
    _id: string;
    createdAt: string;
    updatedAt: string;
  }

  interface IConsigneeData extends ResponseTypes.IPaginationResponse {
    consignees: IConsigneeResponse[];
  }
}
