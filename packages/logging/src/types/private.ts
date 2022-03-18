export type LogWriter = ({write: (str: string, encoding: "utf8") => unknown}) | ((msg: string) => void) | undefined

export enum Severity {
  Debug = 5,
  Info = 9,
  Warn = 13,
  Error = 17
}

export interface Event {
  time?: string;
  sev?: Severity;
  name?: string;
  body?: string | object;
  tn?: string;
  trace?: string;
  span?: string;
  res?: {
    svc?: {
      name?: string;
      ver?: string;
      inst?: string;
    };
  };
  attr?: {
    [key: string]: object | string | number | boolean | null | undefined;
    http?: {
      method?: string;
      statusCode?: number;
      url?: string;
      target?: string;
      host?: string;
      scheme?: string;
      route?: string;
      userAgent?: string;
      clientIp?: string;
      server?: {
        duration?: number;
      };
      client?: {
        duration?: number;
      };
    };
    db?: {
      name?: string;
      statement?: string;
      operation?: string;
      duration?: number;
    };
    exception?: {
      type?: string;
      message?: string;
      stacktrace?: string;
    };
  };
  vis?: number;
}
