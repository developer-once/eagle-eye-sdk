import { IConfig } from '../type/index';
import { report } from '../report/report';
import { getDomUniqueId, getPageUrl } from '../../utils/index';

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
    let target: any = getDomUniqueId(event?.target);
    if (!target.id || !target.type) {
      return
    }
    report('click', {
      url: getPageUrl(true),
      dom: target,
    }, config);
  }

  document?.body?.addEventListener("click", clickEvent);

  config.eventCenter.set({
    type: "clickEvent",
    func: clickEvent
  });
};