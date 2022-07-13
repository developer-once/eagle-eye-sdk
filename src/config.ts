/**
 * @file config detail file
 * @author JYkid
 * @version 0.0.1-beta
 */
import { IUserConfig, IConfig, IUserIncoming } from './type/index';

function newConfig(conf: IUserConfig): IConfig {
  let config = {
    https: true,
    url: "https://dev-one.cn/api/report",
    config: "https://dev-one.cn/api/get/config",
    app_key: "",
    resourceUrl: [],
    resourceIndex: -1,
    startTime: new Date().getTime() || 0,
    // ------------ 配置 ------------
    // - 是否开启 rrweb -
    record: false,
    // - 是否开启全局点击 -
    globalClick: true,
    // - 是否开启资源监控 -
    recordReSoure: true,
    // - 禁用 AJAX 请求监听 -
    disableAjax: false,
    // - 禁用 fetch -
    disableFetch: false,
    // - 始化后自动发送 PV -
    autoSendPv: true,
    // - 是否监听页面的 hashchange -
    enableSPA: true,
    // - 开启心跳检测 -
    openHeartbeat: false,
    // 日志采样配置，值1/10/100
    sample: 1,
    // - 开始计时 -
    beginTiming: 0,
    // - 耗费时间 -
    costTime: 0,
    // - 服务端开启 rrweb -
    serverOpenRecord: false,
    // - 慢请求阈值 超过将会被记录 -
    slowAjaxCost: 700,
    // - 慢资源阈值 超过将会被记录 -
    slowResourceCost: 500,
    // - 开发环境不会记录错误 -
    silentDev: false,
    // - 版本号 用户可手动传入 -
    version: "1.0.0",
    // - behaviorMax -
    behaviorMax: 10,
    extend: (config: any, conf: IUserIncoming) => {
      Object.assign(config, conf);
      return config;
    }
  }
  return config.extend(config, conf);
}

export default newConfig;
