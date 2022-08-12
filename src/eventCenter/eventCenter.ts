/**
 * --- 事件中心 ---
 */
import { getEventMessage } from "../wrap";
import { IEventCenter, IConfig } from "../type/index";
import { report } from '../report/report';

const eventCenter = function (): IEventCenter {
  let event: IEventCenter = {
    sending: false,
    // -- event ---
    event: [],
    // -- eventListener --
    data: [],
    // -- rrweb --
    record: [ [], [] ],
    get() {
      return this.data
    },
    set(event: any) {
      this.data.push(event);
    },
    setEvent(event: any, config: IConfig) {
      this.event.push(event);

      // ----- 条数大于预设值时发送事件 -----
      if (this.event.length >= config.behaviorMax && !this.sending) {
        this.sending = true;
        this.reportEvent(config);
      }
    },
    reportEvent(config: IConfig) {
      report("click", this.event, config);
      
      this.data.splice(0, this.data?.length);
      this.sending = false;
    },
    getRecord() {
      const length = this.record.length;
      const events = this.record[length - 2].concat(this.record[length - 1]);
      return events;
    },
    setRecord(event: any) {
      const lastEvents = this.record[this.record.length - 1];
      lastEvents.push(event);
    },
    setCheckout() {
      this.record.push([]);
    },
    clearRecord() {
      this.record.splice(0, self.record?.length);
    },
  };
  return event;
}

export default eventCenter;