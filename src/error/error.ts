import { IConfig } from '../type/index';
import { reportError, reportResourceError } from '../wrap';

/**
 * --- 监听全局 Promise 错误 ---
 */
const initListenPromise = (config: IConfig) => {
  // 当Promise 被 reject 且没有 reject 处理器的时候，会触发 unhandledrejection 事件；这可能发生在 window 下，但也可能发生在 Worker 中。
  const unhandledrejection = function(err: PromiseRejectionEvent) {
    reportError(err, config);
  }
  window.addEventListener("unhandledrejection", unhandledrejection);
  // --- 挂载监听 ---
  config.eventCenter.set({
    type: "unhandledrejection",
    func: unhandledrejection
  });
}

/**
 * --- 监听全局的 JS 错误和资源加载错误 ---
 * @param recordReSoure 是否取消监听资源错误
 */
const initListenGlobalJsError = (config: IConfig) => {
  const globalEventHandlers = (e: ErrorEvent) => {
    const target = e.target as any;
    if (target != window) {
      if (!config.recordReSoure) { return }
      // -- 静态资源加载的 error 事件 --
      reportResourceError(e, config);
    } else {
      // -- 判断错误是否来自 eagle-eye 该方法仅能防止 script 方式引入的重复报错 --
      if (e.filename.indexOf('eagle-eye') > -1) {
        return;
      }
      reportError(e, config);
    }
  }
  window.addEventListener("error", globalEventHandlers, true);
  // --- 挂载监听 ---
  config.eventCenter.set({
    type: "error",
    func: globalEventHandlers
  });
}

/**
 * --- 监听全局 Ajax 错误 ---
 * @param setHttpBody 
 */
const initListenAjax = (config: IConfig ,setHttpBody?: Boolean) => {
  if (window.XMLHttpRequest && window.XMLHttpRequest.prototype) {
    let open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method: string, url: string | URL) {
			try {
        // @ts-ignore
        this.eagleTemp = {
          method: method,
          url: url,
          startTime: (new Date).getTime(),
        }
        open.apply(this, arguments as any)
			} catch (err: any) {

      }
		};

    let originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function (body?: Document | XMLHttpRequestBodyInit | null | undefined) {
      try {
        const self: any = this;
        let originalOnloadend: ((this: XMLHttpRequest, ev: ProgressEvent<EventTarget>) => any) | null
        if ('onloadend' in this) {
          originalOnloadend = this.onloadend
        }
        this.onloadend = function(e: any) {
          if (e) {
            const target = e.target as XMLHttpRequest;
            // --- 应用原 XHR 上报 ---
            originalOnloadend && originalOnloadend.apply(this, [e])
            try {
              // --- 来自 SDK 的请求不监控 ---
              // @ts-ignore
              if (this.sendByEagle) { return }
              const currentTime = new Date().getTime();
              const apiCost = currentTime - self.eagleTemp.startTime;
              const method = self.eagleTemp.method;
              const url = target.responseURL || self.eagleTemp.url;
              const status = target.status;
              const statusText = target.statusText
              const response = target.response;
              // ---- 请求报错 ----
              if (status !== 200) {
                reportError({
                  type: "ajaxLoad",
                  detail: {
                    apiCost: apiCost,
                    method: method,
                    responseUrl: url,
                    status: status,
                    statusText: statusText,
                    response: response,
                  }
                }, config);
              }

              // ---- 慢请求 ----
              if (apiCost > (config.slowAjaxCost || 0)) {
                reportError({
                  type: "ajaxSlow",
                  detail: {
                    apiCost: apiCost,
                    method: method,
                    responseUrl: url,
                    status: status,
                    statusText: statusText,
                  }
                }, config);
              }
            } catch (err: any) {}
          }
        }
      } catch(err : any) {
      } finally {
        originalSend?.apply(this, arguments as any)
      }
    }
  }
}

/**
 * --- 全局监听 Fetch 错误 ---
 * 需要res.clone 否则会被标记使用过
 */
const initListenFetch = (config: IConfig) => {
  if (window.fetch) {
    let _fetch = fetch;
    window.fetch = function (e: any, u: any) {
      // @ts-ignore
      return _fetch.apply(this, arguments).then(
        response => {
          const cloneResponse = response.clone();

          // ---- fetch response 状态被修改 ----
          if(!cloneResponse.ok) {
            reportError({
              type: "fetchError",
              detail: {
                method: "fetch",
                status: cloneResponse.status,
                statusText: cloneResponse.statusText,
                responseUrl: cloneResponse.url,
                response: cloneResponse
              }
            }, config);
          }
          return response
        }
      ).catch((err: any) => {
        try {

          // ---- fetch error ----
          reportError({
            type: "fetchError",
            detail: {
              method: "fetch",
              responseUrl: e,
              response: JSON.stringify(err),
            }
          }, config);
        } catch (err: any) {}
        return err
      })
    };
  }
}

export {
  initListenPromise,
  initListenGlobalJsError,
  initListenAjax,
  initListenFetch,
}