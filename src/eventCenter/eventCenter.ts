/**
 * --- 事件中心 ---
 */
 import { IEventCenter } from "../type/index";

 const eventCenter = function(): IEventCenter {
   let event: IEventCenter = {
     data: [],
     record: [
       [],
       [],
     ],
     // ---- report wait list ----
     // reportList: [],
     get: function() {
       return this.data
     },
     set: function(event: any) {
       this.data.push(event);
     },
     getRecord: function() {
       const len =  this.record.length;
       const events = this.record[len - 2].concat(this.record[len - 1]);
       return events;
     },
     setRecord: function(event: any) {
       const lastEvents = this.record[this.record.length - 1];
       lastEvents.push(event);
     },
     setCheckout: function() {
       this.record.push([]);
     },
     clearRecord() {
       this.record.splice(0, self.record?.length);
     },
   };
   return event;
 }
 
 export default eventCenter;