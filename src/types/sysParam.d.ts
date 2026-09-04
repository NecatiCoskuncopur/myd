declare namespace SysParamTypes {
  interface ICreateSysParamPayload {
    key: string;
    value: string;
  }

  interface IUpdateSysParamPayload extends ICreateSysParamPayload {
    paramId: string;
  }

  interface ISysParam {
    _id: string;
    key: string;
    value: string;
  }

  interface ISysParamData extends ResponseTypes.IPaginationResponse {
    sysParams: ISysParam[];
  }

  interface ISysParamParams extends ParamsTypes.IPaginationParams {
    key?: string;
  }
}
