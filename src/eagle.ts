/**
 * --- eagle-eye SDK 对象 ---
 * @param config
 * @returns eagle
 */
import { IConfig } from './type/index';
import { report } from './report/report';

const eagle = function (config: IConfig) {
  return {
    config: config,
    // ---- 销毁监控 ----
    destory: function () {
      const array = this.config?.eventCenter?.get();
      for (let i = 0; i < array.length; i++) {
        // event type add different stage
        if (array[i].type === 'error') {
          window.removeEventListener(array[i].type, array[i].func, true);
        } else {
          window.removeEventListener(array[i].type, array[i].func);
        }
      }
    },
    // ---- 获取监控数据 ----
    getRecord: function () {
      const array = this.config?.eventCenter?.getRecord();
      return array;
    },
    // ---- 主动上报 ----
    report: function (type: string, eventData: any = {}) {
      return report(type, eventData, this.config);
    },
    // ---- 主动上报错误 ----
    // ---- 重新设置 Config ----
    setConfig: function () {},
    // ---- 计时开始 ----
    start: function () {
      this.config.beginTiming = new Date().getTime();
    },
    stop: function () {
      // --- 只有开始计时的时候才算时间 ---
      if (this.config.beginTiming) {
        this.config.costTime = new Date().getTime() - this.config.beginTiming;
        this.config.beginTiming = 0;
      } else {
        // --- 否则使用 startTime 作为默认时间 ---
        this.config.costTime = new Date().getTime() - this.config.startTime;
      }
    }
  }
}

export default eagle;