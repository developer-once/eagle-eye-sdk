import { IConfig } from '../type/index';
import { isIE, getPageUrl } from '../../utils/index';
import { report } from '../report/report';

/**
 * ---- 首屏时间 ----
 * @returns score { number }
 */
export const initListenFCP = (config: IConfig) => {
  // 不支持 MutationObserver 的话
  if (!window.MutationObserver) { return }

  let calcFirstScreenTime = "pending";
  let observerData: any = [];
  // const startTime = new Date().getTime();
  let firstScreenTime = 0;

  // --- 没有完成页面初始化加载的时候就关闭 ---
  const unmountObserver = (delayTime: number, immediately?: boolean) => {
    if (observer) {
      // MutationObserver 停止观察变动
      // 如果没有停止的话会间隔 500ms 重复观察
      if (immediately || compare(delayTime)) {
        observer.disconnect();
        observer = null;

        getfirstScreenTime()

        calcFirstScreenTime = 'finished';
      } else {
        setTimeout(() => {
          unmountObserver(delayTime);
        }, 500);
      }
    }
  }
  
  const unmountObserverListener = () => {
    if (calcFirstScreenTime === 'pending') {
      unmountObserver(0, true);
    }
    if(!isIE()){
      window.removeEventListener('beforeunload', unmountObserverListener);
    }
  };
  window.addEventListener('beforeunload', unmountObserverListener);
  // --- 挂载监听 ---
  config.eventCenter.set({
    type: "beforeunload",
    func: unmountObserverListener
  });

  const removeSmallScore = (observerData: any): any => {
    for (let i = 1; i < observerData.length; i++) {
      if (observerData[i].score < observerData[i - 1].score) {
        observerData.splice(i, 1);
        return removeSmallScore(observerData);
      }
    }
    return observerData;
  };

  const getfirstScreenTime = () => {
    observerData = removeSmallScore(observerData);
    let data: any;
    for (let i = 1; i < observerData.length; i++) {
      if (observerData[i].time >= observerData[i - 1].time) {
        const scoreDiffer = observerData[i].score - observerData[i - 1].score;
        if (!data || data.rate <= scoreDiffer) {
          data = { time: observerData[i].time, rate: scoreDiffer };
        }
      }
    }

    firstScreenTime = data?.time || 0;
    config.firstScreenTime = firstScreenTime;
    // --- 监听是否自动发送 uv ---
    if (config.autoSendPv) {
      report(performance?.navigation?.type === 1 ? 'pv' : 'uv', {
        domready: false,
        url: getPageUrl(),
        // --- 刷新还是正常访问 - 刷新需要单独记录 ---
        type: performance?.navigation?.type === 1 ? "reload" : "normal",
      }, config);
    }
  }

  const traverseEl = (element: any, layer: number, identify?: boolean) => {
    // 窗口可视高度
    const height = window.innerHeight || 0;
    let score = 0;
    const tagName = element.tagName;
    if (
      tagName !== 'SCRIPT' &&
      tagName !== 'STYLE' &&
      tagName !== 'META' &&
      tagName !== 'HEAD'
    ) {
      const len = element.children ? element.children.length : 0;
      if (len > 0) {
        for (let children = element.children, i = len - 1; i >= 0; i--) {
          score += traverseEl(children[i], layer + 1, score > 0);
        }
      }
      // 如果元素高度超出屏幕可视高度直接返回 0 分
      if (score <= 0 && !identify) {
        if (
          element.getBoundingClientRect &&
          element.getBoundingClientRect().top >= height
        ) {
          return 0;
        }
      }
      score += 1 + 0.5 * layer;
    }
    return score;
  }
  
  // 每次 dom 结构改变时，都会调用里面定义的函数
  let observer: any = new window.MutationObserver(() => {
    // 当前时间 - 性能开始计算时间
    const time = new Date().getTime() - config.startTime;
    const body = document.querySelector('body');
    let score = 0;
    if (body) {
      score = traverseEl(body, 1, false);
      observerData.push({ score, time });
    } else {
      observerData.push({ score: 0, time });
    }
  });
  
  // 设置观察目标，接受两个参数: target：观察目标，options：通过对象成员来设置观察选项
  // 设为 childList: true, subtree: true 表示用来监听 DOM 节点插入、删除和修改时
  observer.observe(document, { childList: true, subtree: true });
  
  observer = observer;

  config.observerData = observerData;

  const compare = (delayTime: any) => {
    // 当前所开销的时间
    const _time = Date.now() - config.startTime;
    // 取最后一个元素时间 time
    const time =
      (
        observerData &&
        observerData.length &&
        observerData[observerData.length - 1].time) ||
      0;
    return _time > delayTime || _time - time > 2 * 500;
  }

  if (document.readyState === 'complete') {
    // MutationObserver 监听的最大时间 10 秒，超过 10 秒将强制结束
    unmountObserver(10000);
  } else {
    window.addEventListener(
      'load',
      () => {
        unmountObserver(10000);
        // getfirstScreenTime();
      },
      false
    );
  }
};

/**
 * ---- 获取 Performance 性能数据 ----
 * @param config 
 * @returns 
 */
export const getPerformance = (config: IConfig) => {
  let data: any = {};
  // --- performance.timing - For SSR ---
  const timing: any = performance?.timing || {};
  data.time = {
    newPage: timing?.fetchStart - timing?.navigationStart || 0,
    redirect: timing?.redirectEnd - timing?.redirectStart || 0,
    appcache: timing?.domainLookupStart - timing?.fetchStart || 0,
    unload: timing?.unloadEventEnd - timing?.unloadEventStart || 0,
    dnsLooking: timing?.domainLookupEnd - timing?.domainLookupStart || 0,
    tcpConnect: timing?.connectEnd - timing?.connectStart || 0,
    request: timing?.responseEnd - timing?.requestStart || 0,
    whiteScreen: timing?.responseStart - timing?.navigationStart || 0,
    domParse: timing?.domComplete - timing?.domInteractive || 0,
  }

  // --- performance.getEntriesByType - For resource loading time ---
  data.resourceLoading = [];
  // --- 是否开启资源上报监控 ---
  if (config.recordReSoure) {
    performance?.getEntriesByType('resource')?.forEach((item: any, index: number) => {
      // 资源 url 已经被记录 且不是 ajax 请求, 之前出现过的 index 跳过 只使用最新的
      if (config.resourceUrl.indexOf(item.name) !== -1 && item.initiatorType !== 'xmlhttprequest' || index <= config.resourceIndex) {
        return
      }
      config.resourceUrl.push(item.name);
      config.resourceIndex = index;

      let value: any = {
        name: item.name,
        entryType: item.entryType,
        initiatorType: item.initiatorType,
        nextHopProtocol: item.nextHopProtocol,
        transferSize: item.transferSize,
        event_type: "slow",
      }
      /**
       * --- 请求类型 ---
       * - link script img css other
       * - fetch xmlhttprequest
       */
      if (item.initiatorType !== 'xmlhttprequest' && item.initiatorType !== 'fetch') {
        let loadTime = item.responseEnd?.toFixed(0) - item.responseStart?.toFixed(0);
        if (loadTime < (config.slowResourceCost || 0)) { return }
        // --- 加载资源花费的时间 ---
        value.loading = item.responseEnd?.toFixed(0) - item.responseStart?.toFixed(0) || undefined,
          // --- startTime： 开始进入下载的时间 - responseStart 真正开始下载的时间 ---
          value.prepareLoading = item.responseStart?.toFixed(0) - item.startTime?.toFixed(0) || undefined,
          data.resourceLoading.push(value);
      } else {
        let loadTime = item.responseEnd?.toFixed(0) - item.fetchStart?.toFixed(0);
        if (loadTime < (config.slowAjaxCost || 0)) { return }
        // --- 加载资源花费的时间 ---
        value.loading = item.responseEnd?.toFixed(0) - item.fetchStart?.toFixed(0) || undefined;
        value.prepareLoading = 0,
          data.resourceLoading.push(value);
      }
    });
  }

  return data;
}