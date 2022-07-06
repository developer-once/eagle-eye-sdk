
export interface IEventCenter {
  event: Array<any>;
  data: Array<any>;
  record: Array<any>;
  readonly get: () => Array<any>;
  readonly getRecord: () => Array<any>;
  readonly set: (data: any) => void;
  readonly setEvent: (data: any, config: IConfig) => void;
  readonly setRecord: (data: any) => void;
  readonly setCheckout: () => void;
  readonly clearRecord: () => void;
}

export type IUserConfig = {
  https: boolean;
  url: string;
  app_key: string;
  record?: boolean;
  globalClick?: boolean;
  sendResource?: boolean;
  disableAjax?: boolean;
  disableFetch?: boolean;
  autoSendPv?: boolean;
  enableSPA?: boolean;
  openHeartbeat?: boolean;
  sample?: number;
  beginTiming?: number;
  costTime?: number;
  slowAjaxCost?: number,
  slowResourceCost?: number,
}

export interface IUserIncoming {
  [propName: string]: any;
}

export interface IConfig extends IUserConfig {
  startTime: number;
  protocol: string;
  resourceUrl: Array<string>;
  resourceIndex: number;
  eventCenter: IEventCenter;
  serverOpenRecord: Boolean;
  readonly extend: (config: IConfig, conf: IUserIncoming) => any;
  readonly getRrwebEvent: () => Array<any>;
  [propName: string]: any;
}
