## Eagle-EYE-SDK

Eagle-eye 是一款全埋点的监控 SDK，只需简单的引入和传入配置便可以在项目中一键接入。

## 使用

只需要引入并初始化， SDK 就会开始进行默认的全埋点监控。对用户的点击事件进行上报，以及默认使用。
### NPM 接入

```js
// 下载 SDK
npm install eagle-eye-sdk -S

// app.ts
import { initMonitor } from 'eagle-eye-sdk';
const monitor = initMonitor({
  url: "/api/report",
  globalClick: true,
  // 以下两项为必填
  app_key: "vite_test",
  startTime: new Date().getTime()
})

// 销毁
// monitor.destory()

function App() {}
export default App
```

### Script 接入


```html
<script crossorigin="anonymous" src="./eagle-eye.js"></script>
<script>
  var config = {
    url: "/api/report",
    globalClick: true,
    // 以下两项为必填
    app_key: "vite_test",
    startTime: new Date().getTime()
  };
  
  window.monitor = window.eagleEye.initMonitor(config);
</script>
```

## 配置项

| 参数名 | 类型 | 必填 | 描述 | 默认值 | 备注 |
| ------  | ---- | ---- | ---- | ------ | ---- |
|  app_key          |  string    | true |  每个项目一个，请于后台创建项目生成                                       |  -                    |    |
|  url              |  string    | true |  设定日志上传地址，一般不用修改，请务必清楚修改该字段的意义                   |  -                    |    |
|  startTime        |  number    |      |  初始化的时间                                                          | new Date().getTime() |    |
|  slowAjaxCost     |  number    |      |  慢请求阈值，超过将会被记录                                              |  700                  |    |
|  slowResourceCost |  number    |      |  慢资源阈值，超过将会被记录                                              |  400                  |    |
|  record           |  boolean   |      |  是否记录报错录制回放，由于上报回放 rrweb,请求庞大请在后台通过项目设置开启      |  false                |    |
|  enableSPA        |  boolean   |      |  是否监听页面的 hashchange 事件并重新上报 PV，适用于单页面应用场景           |  true                 |    |
|  autoSendPv       |  boolean   |      |  是否初始化后自动发送 PV，默认会自动发送                                   |  true                 |    |
|  recordReSoure     |  boolean   |      |  是否上报资源数据，默认会                                                |  true                 |    |
|  disableHook      |  boolean   |      |  是否禁用 AJAX 请求监听，默认会监听并用于 API 调用成功率上报                 |  false                |    |
|  globalClick      |  boolean   |      |  是否监听全局点击事件                                                   |  false                 |    |
|  disableAjax      |  boolean   |      |  是否禁止监听 Ajax                                                     |  false                 |    |
|  disableFetch     |  boolean   |      |  是否禁止监听 fetch                                                    |  false                 |    |
|  openHeartbeat    |  boolean   |      |  是否开启心跳检测                                                       |  false                 |    |
|  serverOpenRecord |  boolean   |      |  服务端开启报错回放录制，注意请不要配置该字段，应在后台设置                    |  false                 |    |



## 开发

```
npm run start
```
