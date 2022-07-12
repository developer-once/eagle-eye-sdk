import { getEventMessage } from "../wrap";

/**
 * ---- Ajax 请求 ----
 * @param url 
 * @param data 
 * @param timeout 
 */
/* eslint-disable */
export const ajax = function (url: any, data: any, timeout?: any) {
  var xhr = new XMLHttpRequest();
  xhr.open("post", url, true);
  xhr.setRequestHeader("content-type", "application/json;charset=utf-8");
  xhr.setRequestHeader("Accept", "application/json");
  xhr.timeout = timeout || 30000;
  // @ts-ignore
  xhr.sendByEagle = true;
  xhr.onload = function () {
    if (!xhr?.responseText || typeof xhr?.responseText !== 'string') {
      return
    }
  };
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        if (!xhr?.responseText || typeof xhr?.responseText !== 'string') {
          return
        }
        // -------------- 接受服务端开启报错监控数据 --------------
        try {
          var result = JSON?.parse(xhr?.responseText || "{}");
          if (result.code === 200 && result.serverOpenRecord) {
            const config = window?.eagleEye?.config || {};
            if (config.record) { 
              return
            }
            window?.rrweb?.record({
              emit(event: any, isCheckout: boolean) {
                // -- 用任意方式存储 event --
                if (isCheckout) {
                  config.eventCenter.setCheckout();
                }
                config.eventCenter.setRecord(event);
              },
              // -- 每 5s 重新制作快照 --
              checkoutEveryNms: 5 * 1000,
            });
            config.record = true;
          }
        } catch (err: any) {}
      } else {
        // throw new Error("eagle-eye: 网络请求错误，请稍后再试～");
      }
    }
  };
  // xhr.onreadystatechange = function () {};
  xhr.send(window.JSON.stringify(data));
}


/**
 * ---- 数据上报 ----
 * @param type 
 * @param eventData 
 * @param config 
 */
export const report = (type: string, eventData: any, config?: any) => {
  let data = getEventMessage(type, eventData, config);
  ajax(config.url, data, function() {
    config._clearEvent();
  });
};
