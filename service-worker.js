// - 每 10s 检查一次 -
const CHECK_CRASH_INTERVAL = 10 * 1000;
// - 25s 超过 25s 没有心跳则认为已经 crash -
const CRASH_THRESHOLD = 25 * 1000;
let timer;
// - 主页传递参数 - 上报的对象 -
const pages = {};

// ---- 检测页面是否 crash ----
function checkCrash() {
  const now = Date.now();
  for (var id in pages) {
    let page = pages[id];
    if ((now - page.t) > CRASH_THRESHOLD) {
      // 上报 crash
      console.log("++++++++++页面发生崩溃+++++++++++++++", self);
      const location = self.location;
      const app_key = location.search.split("appKey=")[1] || "";
      fetch("http://localhost:7001/report/crash", {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          app_key: app_key,
          origin: location.origin,
        }),
      }).then((res) => {
        console.log("++++++++", res);
      })
      delete pages[id];
    }
  }
  if (Object.keys(pages).length == 0) {
    clearInterval(timer);
    timer = null;
  }
}

this.addEventListener('message', (e) => {
  const data = e.data;
  if (data.type === 'running') { // 正常心跳
    pages[data.id] = {
      t: Date.now(),
    }
    if (!timer) {
      timer = setInterval(function () {
        checkCrash();
      }, CHECK_CRASH_INTERVAL);
    }
  } else if (data.type === 'clear') {
    delete pages[data.id]
  }
})