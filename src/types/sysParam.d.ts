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
}
