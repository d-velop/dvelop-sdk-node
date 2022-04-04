/**
 * The log event used by d.velop for otel logging.
 */
export interface Event {
  time?: string;
  sev?: OtelSeverity;
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
    [key: string]: AnyJsonValue | undefined;
    http?: EventAttributesHttp;
    db?: EventAttributesDb;
    exception?: EventAttributesException;
  };
  vis?: number;
}

export type AnyJsonValue = object | string | number | boolean | null;

export interface EventAttributesHttp {
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
}

export interface EventAttributesDb {
  name?: string;
  statement?: string;
  operation?: string;
  duration?: number;
}

export interface EventAttributesException {
  type?: string;
  message?: string;
  stacktrace?: string;
}

export enum OtelSeverity {
  TRACE1 = 1,
  TRACE2 = 2,
  TRACE3 = 3,
  TRACE4 = 4,
  DEBUG1 = 5,
  DEBUG2 = 6,
  DEBUG3 = 7,
  DEBUG4 = 8,
  INFO1 = 9,
  INFO2 = 10,
  INFO3 = 11,
  INFO4 = 12,
  WARN1 = 13,
  WARN2 = 14,
  WARN3 = 15,
  WARN4 = 16,
  ERROR1 = 17,
  ERROR2 = 18,
  ERROR3 = 19,
  ERROR4 = 20,
  FATAL1 = 21,
  FATAL2 = 22,
  FATAL3 = 23,
  FATAL4 = 24
}
