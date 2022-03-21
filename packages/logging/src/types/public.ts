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
   * Measures the duration of an inbound HTTP request in milliseconds.
   */
  serverDuration?: number;
  /**
   * Measures the duration of an outbound HTTP request in milliseconds.
   */
  clientDuration?: number;
}
