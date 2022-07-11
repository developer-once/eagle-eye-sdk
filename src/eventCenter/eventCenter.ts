/**
 * --- 事件中心 ---
 */
import { getEventMessage } from "../wrap";
import { IEventCenter, IConfig } from "../type/index";
import { report } from '../report/report';

const eventCenter = function (): IEventCenter {
  let event: IEventCenter = {
    sending: true,
    event: [],
    data: [],
    record: [
      [],
      [],
    ],
    // ---- report wait list ----
    // reportList: [],
    get: function () {
      return this.data
    },
    set: function(event: any) {
      this.data.push(event);
    },
    setEvent: function (event: any, config: IConfig) {
      this.data.push(event);

      // ----- 条数大于预设值时发送事件 -----
      if (this.data.length >= config.behaviorMax && !this.sending) {
        this.sending = true;
        this.reportEvent(config);
      }
    },
    reportEvent: function (config: IConfig) {
      this.data.map((item: any) => {
        report(item.type, item.data, config);
      });
      this.data.splice(0, this.data?.length);
      this.sending = false;
    },
    getRecord: function () {
      const len = this.record.length;
      const events = this.record[len - 2].concat(this.record[len - 1]);
      return events;
    },
    setRecord: function (event: any) {
      const lastEvents = this.record[this.record.length - 1];
      lastEvents.push(event);
    },
    setCheckout: function () {
      this.record.push([]);
    },
    clearRecord() {
      this.record.splice(0, self.record?.length);
    },
  };
  return event;
}

export default eventCenter;