import { DvelopContext } from "@dvelop-sdk/core";

/**
 * Severity of log statement
 */
export enum Severity {
  debug,
  info,
  warn,
  error
}

/**
 * Several options for a log statement, that can be used by logging providers.
 */
export interface DvelopLogEvent {
  /**
   * A value containing the body of the log record. Can be for example
   * a human-readable string message (including multi-line) describing the event in
   * a free form or it can be a structured data composed of arrays and maps of other
   * values. Can vary for each occurrence of the event coming from the same source.
   */
  message?: string | object;
  /**
   * Short **event identifier** that does not contain varying parts.
   * `Name` describes what happened (e.g. "ProcessStarted"). Recommended to be
   * no longer than 50 characters. Not guaranteed to be unique in any way.
   * Typically used for filtering and grouping purposes in backends.<br>
   * Can be used to identify domain events like `FeaturesRequested` or `UserLoggedIn` (cf. example).
   */
  name?: string;
  /**
   * Specifies if the the logstatement is visible for tenant owner / customer.
   */
  invisible?: boolean;

  /**
   * Incoming http request.
   */
  httpIncomingRequest?: IncomingHttpRequest;
  /**
   * Response of an incoming http request.
   */
  httpIncomingResponse?: HttpResponse;

  /**
   * Outgoing http request.
   */
  httpOutgoingRequest?: OutgoingHttpRequest;
  /**
   * Response of an outgoing http request.
   */
  httpOutgoingResponse?: HttpResponse;

  /**
   * Database request.
   */
  dbRequest?: DbRequest;

  /**
   * An error.
   */
  error?: Error;

  /**
   * Set custom attributes that can be used by a logging provider.
   */
  customAttributes?: {
    [key: string]: object | string | number | boolean | null;
  }

  [key: string]: unknown | undefined;
}

/**
 * Type definition of logging providers.
 */
export type ProviderFn = (context: DvelopContext, severity: Severity, options: DvelopLogEvent) => void;

/**
 * Options needed to create a new {@link DvelopLogger}
 */
export interface DvelopLoggerOptions {
  provider: ProviderFn[];
}

/**
 * Information about outbound db requests.
 */
export interface DbRequest {
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

/**
 * Information about incoming http requests
 */
export interface IncomingHttpRequest {
  /**
   * HTTP request method in upper case. For example GET, POST, DELETE
   */
  method: string;
  /**
   * Full HTTP request URL in the form `scheme://host[:port]/path?query[#fragment]`.
   * Usually the fragment is not transmitted over HTTP, but if it is known,
   * it should be included nevertheless.
   *
   * MUST NOT contain credentials passed via URL in form of `https://username:password@www.example.com/`.
   * In such case the attribute's value should be `https://www.example.com/`.
   */
  url: string;
  /**
   * Values of some http headers.
   */
  headers?: {
    /**
     * Value of the HTTP User-Agent header sent by the client.
     */
    userAgent?: string;
  };
  /**
   * The IP address of the original client behind all proxies, if known (e.g. from X-Forwarded-For).
   */
  clientIp?: string;
  /**
   * The matched route (path template). For example `/users/:userID`
   */
  routeTemplate?: string;
}

/**
 * Information about outgoing http requests
 */
export interface OutgoingHttpRequest {
  /**
   * HTTP request method in upper case. For example GET, POST, DELETE
   */
  method: string;
  /**
   * Full HTTP request URL in the form `scheme://host[:port]/path?query[#fragment]`.
   * Usually the fragment is not transmitted over HTTP, but if it is known,
   * it should be included nevertheless.
   *
   * MUST NOT contain credentials passed via URL in form of `https://username:password@www.example.com/`.
   * In such case the attribute's value should be `https://www.example.com/`.
   */
  url: string;
  /**
   * Values of some http headers.
   */
  headers?: {
    /**
     * Value of the HTTP User-Agent header sent by the client.
     */
    userAgent?: string;
  };
}

/**
 * Information about http responses
 */
export interface HttpResponse {
  /**
   * HTTP request method in upper case. For example GET, POST, DELETE
   */
  method: string;
  /**
   * HTTP response status code
   */
  statusCode: number;
  /**
   * Full HTTP request URL in the form `scheme://host[:port]/path?query[#fragment]`.
   * Usually the fragment is not transmitted over HTTP, but if it is known,
   * it should be included nevertheless.
   *
   * MUST NOT contain credentials passed via URL in form of `https://username:password@www.example.com/`.
   * In such case the attribute's value should be `https://www.example.com/`.
   */
  url: string;
  /**
   * Measures the duration of an incoming HTTP request in milliseconds.
   */
  serverDuration?: number;
  /**
   * Measures the duration of an outgoing HTTP request in milliseconds.
   */
  clientDuration?: number;
  /**
   * The matched route (path template). For example `/users/:userID`.
   * Only relevant for responses of incoming http requests
   */
  routeTemplate?: string;
}
