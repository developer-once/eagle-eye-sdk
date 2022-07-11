/**
 * -- 开启心跳检测 --
 * @param { Object } config
 */
const initHeartbeat = (config: any) => {
  // -- 如果浏览器支持 serviceWorker --
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(`service-worker.js?appKey=${config.app_key}`, {
      scope: './'
    }).then((res: any) => {
      if (navigator?.serviceWorker?.controller !== null) {
        // - 每五秒发一次心跳 -
        let HEARTBEAT_INTERVAL = 10 * 1000;
        // - 发送消息的 ID -
        let sessionId = "";
        // --- 发送心跳 ---
        let heartbeat = function () {
          const data = {
            type: 'running',
            id: sessionId,
            // 附加信息，如果页面 crash，上报的附加数据
            data: config,
          }
          navigator?.serviceWorker?.controller?.postMessage(JSON.parse(JSON.stringify(data)));
        }
        // --- 卸载 ---
        window.addEventListener("beforeunload", function () {
          navigator?.serviceWorker?.controller?.postMessage({
            type: 'clear',
            id: sessionId
          });
        });
        setInterval(heartbeat, HEARTBEAT_INTERVAL);
        heartbeat();
      }
    });
  }
};

export default initHeartbeat;