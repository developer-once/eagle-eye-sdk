declare module "rrweb" {
  export interface record {
    protocol?: string;
    hostname?: string;
    pathname?: string;
  }
}

interface Window {
  [propName: string]: any;
  XMLHttpRequest: any;
}

interface History {
  [propName: string]: any;
}