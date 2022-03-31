import { DvelopHttpResponse } from "@dvelop-sdk/core";

export interface OtelHttpEvent {
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

export interface OtelDatabaseRequest {
  /**
   * This attribute is used to report the name of the database
   * being accessed. For example customers oder main.
   */
  name?: string;
  /**
   * The database statement being executed. Must be sanitized to
   * exclude sensitive information.
   * For example `SELECT * FROM wuser_table; SET mykey "WuValue"`.
   */
  statement?: string;
  /**
   * The name of the operation being executed, e.g. the MongoDB
   * command name such as `findAndModify`, or the SQL keyword.
   * For example `findAndModify; HMSET; SELECT`.
   */
  operation?: string;
  /**
   * measures the duration of the db request in milliseconds.
   */
  duration?: number;
}

export interface OtelLogEvent {
  body: any;
  name?: string;
  visability?: boolean;
  timestampOverwrite?: Date;
  app?: {
    name: string;
    version: string;
    instanceId: string;
  };
  incomingRequest?: OtelHttpEvent;
  incomingRequestResponse?: OtelHttpEvent;
  outgoingRequestResponse?: DvelopHttpResponse | OtelHttpEvent;
  databaseRequest?: OtelDatabaseRequest;
  error: Error;
}