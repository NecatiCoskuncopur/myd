declare namespace SysParamTypes {
  interface ICreateSysParamPayload {
    key: string;
    value: string;
  }

  interface IUpdateSysParamPayload extends ICreateSysParamPayload {
    paramId: string;
  }
}
