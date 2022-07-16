// @ts-ignore
import md5 from '../utils/md5';
import { IConfig } from './type/index';
import { ajax } from './report/report';
import { generateUUID, getPageUrl } from '../utils/index';
import { getPerformance } from './performance/performance';


// ----- 获取 uuid -----
export const getUuid = () => {
  let uuid = localStorage.getItem("eagle-uuid") || generateUUID();

  if (uuid) {
    localStorage.setItem("eagle-uuid", uuid)
  }

  return uuid;
}

// ----- 获取错误指纹 -----
export const getErrorFingerprint = (error: any) => {
  return md5(`${error.filename}-${error.lineno}-${error.message}-${error.error?.stack}`);
};

// ----- 获取核心标识信息 -----
export const getCoreMessage = () => {
  let data: any = {};
  data.uuid = getUuid();
  data.referrer = document?.referrer;
  
  return data;
}

// ----- 获取浏览器信息 -----
export const getWrapper = (config: IConfig) => {
  let data: any = getCoreMessage();
  let navigator = window.navigator;

  // UA
  data.userAgent = navigator.userAgent;

  // appName
  data.appName = navigator.appName;

  // appVersion
  data.appVersion = navigator.appVersion;

  // CPU
  // @ts-ignore
  data.cpuClass = navigator.cpuClass;

  // platform
  data.platform = navigator.platform;

  // languages
  data.language = navigator.language;

  data.origin = window?.location?.origin;

  data.host = window?.location?.host;

  // url
  data.url = getPageUrl();

  // time
  data.time = new Date().getTime();

  let performance = getPerformance(config);

  Object.assign(data, performance);

  return data;
};

// ----- 获取错误信息 -----
export const getErrorMessage = (error: any, config: IConfig, resource?: boolean) => {
  let data = getWrapper(config);
  data.detail = {};
  data.detail = {
    ...error.detail
  }
  data.event_type = error.type;

  // --------- Error 错误相关 ------------
  if (error.type === "error" && !resource) {
    data.error = {};
    data.error = {
      ...error.detail
    }
    data.error.stack = error.error?.stack;
    data.error.message = error.message;
    data.error.line = error.lineno;
    data.error.filename = error.filename;
    data.error.fingerprint = getErrorFingerprint(error);
    data.stack = error.stack;
  }
  // --------- Promise ---------
  if (error.type === "unhandledrejection") {
    data.error = {};
    data.error = {
      ...error.detail
    }
    if (error?.reason) {
      data.error.message = JSON.stringify(error?.reason);
    }
  }

  // --------- 资源相关 ---------
  if (resource) {
    data.resource = {};
    data.resource.src = error.target.currentSrc || error.target.src || error.target.href;
    data.event_type = "resource";
    data.record = [];
  }

  // --------- fetchError ajaxLoad ---------
  if (error.type === "fetchError" || error.type === "ajaxLoad" || error.type === "ajaxSlow") {
    data.ajax = {};
    data.ajax = {
      ...error.detail
    }
    data.record = [];
  }

  data.app_key = config.app_key

  return data;
};

// ----- 获取事件信息 -----
export const getEventMessage = (type: string, eventData: any, config: IConfig) => {
  
  // --------- click 类型是单独的批量上报 ---------
  if (type === "click") {
    return getClickMessage(type, eventData, config);
  }

  let data = getWrapper(config);

  // --------- PV || UV ---------
  if (type === 'uv' || type === 'pv') {
    data.view = {};
    data.view = {
      ...eventData
    }
  }

  

  // ---- 自定义上报类型 ----
  data.detail = {
    ...eventData
  };
  data.event_type = type;
  data.app_key = config.app_key;
  data.firstScreenTime = config.firstScreenTime || 0;
  data.record = [];
  
  return data;
};

// ----- 获取点击事件信息 ----
export const getClickMessage = (type: string, data: any, config: IConfig) => {
  let wrap = getCoreMessage();
  let array: any = [];
  data.map((item: any) => {
    array.push({
      click: item,
      event_type: type,
      app_key: config.app_key,
      ...wrap,
    })
    // return 
  });
  
  return {
    event_type: type,
    data: array,
  };
}

// ----- js 抛出的错误 -----
export const reportError = function(err: any, config: any) {
  let data = getErrorMessage(err, config, false);
  data.record = config.eventCenter.getRecord();
  ajax(config.url, data);
}

// ----- 资源加载错误 -----
export const reportResourceError = function (err: any, config: any) {
  let data = getErrorMessage(err, config, true);
  ajax(config.url, data);
}

