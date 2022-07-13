/**
 * --- 初始化 SDK ---
 */
import { IUserConfig, IConfig } from './type/index';
import newConfig from './config';
import { ajax } from './report/report';
import eventCenter from './eventCenter/eventCenter';
import { initListenFCP } from './performance/performance';
import { initListenHash, initListenBody, sendBeaconBeforeLeave } from './behavior/behavior';
import {
  initListenPromise,
  initListenGlobalJsError,
  initListenAjax,
  initListenFetch,
} from './error/error';
import initHeartbeat from './error/heartbeat';

const initUserConfig = (userConfig: IUserConfig): IConfig => {

  // ---- 如果已经初始化 window 上有对象则返回 ----
  if (window.eagleEye) {
    return window?.eagleEye?.config || userConfig;
  }

  const config: IConfig = newConfig(userConfig);
  config.eventCenter = eventCenter();

  // --- 监听 Dom 变化 ---
  initListenFCP(config);

  // --- 监听 HashRouter 变化 ---
  if (config.enableSPA) {
    initListenHash(config);
  }

  // --- 监听 JS 报错 ---
  initListenGlobalJsError(config);
  initListenPromise(config);

  // --- 监听 AJAX ---
  if (!config.disableAjax) {
    initListenAjax(config);
  }

  // --- 监听 Fetch ---
  if (!config.disableFetch) {
    initListenFetch(config)
  }

  // --- 监听全局点击事件 ---
  if (config.globalClick) {
    initListenBody(config);
  }

  // --- 开启心跳检测 ---
  if (config.openHeartbeat) {
    initHeartbeat(config);
  }

  // --- 开启 rrweb ---
  // --- 需要 script 方式引入 rrweb ---
  if (config.record && window.rrweb) {
    window.rrweb?.record({
      emit(event: any, isCheckout: boolean) {
        // -- 用任意方式存储 event --
        if (isCheckout) {
          config.eventCenter.setCheckout()
        }
        config.eventCenter.setRecord(event)
      },
      // -- 每 5s 重新制作快照 --
      checkoutEveryNms: 5 * 1000,
    });
  }

  // --- 获取 appk_key 配置 ---
  ajax(config.config, {});

  // --- 离开页面之前发送请求 ----
  sendBeaconBeforeLeave(config);

  return config;
};

export default initUserConfig;