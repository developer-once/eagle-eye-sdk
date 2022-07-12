import { IConfig } from '../type/index';
import { report } from '../report/report';
import { getDomUniqueId, getPageUrl } from '../../utils/index';
import { getEventMessage } from "../wrap";

// --- 用户行为检测 ---

let lastHref: string  | null | undefined;
export const initListenHash = (config: IConfig) => {
  let originalPushState: (data: any, unused: string, url?: string | URL | null | undefined) => void
  let originalReplaceState:(data: any, unused: string, url?: string | URL | null | undefined) => void
  const hashChangeHandle = () => {
    if (lastHref === getPageUrl()) {
      return;
    }
    lastHref = getPageUrl();

    // ------ REMOVE ------
    // config.eventCenter.setEvent({
    //   type: "pv",
    //   data: {
    //     type: "hashchange",
    //     url: getPageUrl(),
    //   }
    // }, config);

    report('pv', {
      type: "hashchange",
      url: getPageUrl(),
    }, config);
  }

  if ('pushState' in history) {
    originalPushState =  history.pushState
    history.pushState = function(data, title, url) {
      originalPushState.apply(this, [data, title, url])
      if (lastHref === getPageUrl()) {
        return;
      }
      lastHref = getPageUrl();

      // ------ REMOVE ------
      // config.eventCenter.setEvent({
      //   type: "pv",
      //   data: {
      //     type: "pushState",
      //     url: lastHref,
      //     title: title,
      //     data: data,
      //   }
      // }, config);

      report('pv', {
        type: "pushState",
        url: lastHref,
        title: title,
        data: data,
      }, config);
    }
  }

  if('replaceState' in history) {
    originalReplaceState =  history.replaceState
    history.replaceState = function(data, title, url) {
      originalReplaceState.apply(this, [data, title, url])
      if (lastHref === getPageUrl()) {
        return;
      }
      lastHref = getPageUrl();

      // ------ REMOVE ------
      // config.eventCenter.setEvent({
      //   type: "pv",
      //   data: {
      //     type: "replaceState",
      //     url: lastHref,
      //     title: title,
      //     data: data,
      //   }
      // }, config);
      
      report('pv', {
        type: "replaceState",
        url: lastHref,
        title: title,
        data: data,
      }, config);
    }
  }
  
  const popStateEventHandle = (e: PopStateEvent) => {
    if (lastHref === getPageUrl()) {
      return;
    }
    lastHref = getPageUrl();

    // ------ REMOVE ------
    // config.eventCenter.setEvent({
    //   type: "pv",
    //   data: {
    //     type: "popstate",
    //     url: getPageUrl(),
    //   }
    // }, config);

    report('pv', {
      type: "popstate",
      url: getPageUrl(),
    }, config);
  }
  window.addEventListener('hashchange', hashChangeHandle)
  window.addEventListener('popstate', popStateEventHandle)
  // --- 挂载监听 ---
  config.eventCenter.set({
    type: "hashchange",
    func: hashChangeHandle
  });
  config.eventCenter.set({
    type: "popstate",
    func: popStateEventHandle
  });
}

/**
 * 初始化监听 body 点击事件
 * @param { Object } config
 */
export const initListenBody = (config: IConfig) => {
  // --- JS ---
  const clickEvent = function(event: any) {
    const target: any = getDomUniqueId(event?.target);
    if (!target.id || !target.type) {
      return
    }
    config.eventCenter.setEvent({
      type: "click",
      url: getPageUrl(true),
      dom: target,
    }, config);
    // ------ REMOVE ------
    // report('click', {
    //   url: getPageUrl(true),
    //   dom: target,
    // }, config);
  }

  document?.body?.addEventListener("click", clickEvent);

  config.eventCenter.set({
    type: "clickEvent",
    func: clickEvent
  });
};


/**
 * ---- 用户离开页面之前发送请求 ----
 */
export const sendBeaconBeforeLeave = (config: IConfig) => {
  if ('sendBeacon' in navigator) {

    const leaveEvent = function() {
      let data = getEventMessage("click", config.eventData.data, config);
      navigator.sendBeacon('https://dev-ones.cn/api/report', JSON.stringify(data));
    }

    window.addEventListener('pagehide', leaveEvent, false);

    config.eventCenter.set({
      type: "leaveEvent",
      func: leaveEvent
    });
  }
};