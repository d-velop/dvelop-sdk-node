import { DvelopContext } from "@dvelop-sdk/core";
import { globalLoggingContext } from "./context";
import { DbRequest, HttpResponse, IncomingHttpRequest, OutgoingHttpRequest } from "../types/public";
import { Event, Severity, LogWriter } from "../types/private";

/**
 * Type used by the logging singleton and the `with` functions from this package.
 */
export type Logger = InstanceType<typeof InternalLogger>;

/**
 * Only internally used logger class. Use {@link Logger} instead.
 */
class InternalLogger {

  private readonly modifierFunctions: ((event: Event) => void)[];

  constructor(logger?: InternalLogger) {
    this.modifierFunctions = logger ? [...logger.modifierFunctions] : [];
  }

  /**
   * Log a message with severity `Debug`.
   * @param body A value containing the body of the log record. Can be for example
   * a human-readable string message (including multi-line) describing the event in
   * a free form or it can be a structured data composed of arrays and maps of other
   * values. Can vary for each occurrence of the event coming from the same source.
   */
  public debug(body: string | object): void {
    this.log(Severity.Debug, body);
  }

  /**
   * Log a message with severity `Info`.
   * @param body A value containing the body of the log record. Can be for example
   * a human-readable string message (including multi-line) describing the event in
   * a free form or it can be a structured data composed of arrays and maps of other
   * values. Can vary for each occurrence of the event coming from the same source.
   */
  public info(body: string | object): void {
    this.log(Severity.Info, body);
  }

  /**
   * Log a message with severity `Warn`.
   * @param body A value containing the body of the log record. Can be for example
   * a human-readable string message (including multi-line) describing the event in
   * a free form or it can be a structured data composed of arrays and maps of other
   * values. Can vary for each occurrence of the event coming from the same source.
   */
  public warn(body: string | object): void {
    this.log(Severity.Warn, body);
  }

  /**
   * Log a message with severity `Error`.
   * @param body A value containing the body of the log record. Can be for example
   * a human-readable string message (including multi-line) describing the event in
   * a free form or it can be a structured data composed of arrays and maps of other
   * values. Can vary for each occurrence of the event coming from the same source.
   */
  public error(body: string | object): void {
    this.log(Severity.Error, body);
  }

  /**
   * This is a shortcut for `.withException(error).error("Name: Message")`.
   * @param error An error object
   */
  public exception(error: Error): void {
    logger.withException(error).error(`${error.name}: ${error.message}`);
  }

  /**
   * Return a new logger with information of a DvelopContext (tenantId, traceId, spanId) attached.
   * @param context
   * @returns A new Logger with the information attached
   */
  public withCtx(context: DvelopContext): Logger {
    const logger = new InternalLogger(this);
    logger.modifierFunctions.push((event: Event) => {
      event.tn = context.tenantId;
      event.trace = context.traceId;
      event.span = context.spanId;
    });
    return logger;
  }

  /**
   * Return a new logger with the name set.
   * @param name Short **event identifier** that does not contain varying parts.
   * `Name` describes what happened (e.g. "ProcessStarted"). Recommended to be
   * no longer than 50 characters. Not guaranteed to be unique in any way.
   * Typically used for filtering and grouping purposes in backends.<br>
   * Can be used to identify domain events like FeaturesRequested or UserLoggedIn (cf. example).
   * @returns A new Logger with the information attached
   */
  public withName(name: string): Logger {
    const logger = new InternalLogger(this);
    logger.modifierFunctions.push((event: Event) => {
      event.name = name;
    });
    return logger;
  }

  /**
   * Return a new logger with the visibility property set to 1.
   * @returns {Logger} A new Logger with the information attached
   */
  public withInvisibility(): Logger {
    const logger = new InternalLogger(this);
    logger.modifierFunctions.push((event: Event) => {
      event.vis = 0;
    });
    return logger;
  }

  /**
   * Return a new logger with the request attributes set.
   * @param req Incoming or Outgoing Request
   * @returns {Logger} A new Logger with the information attached
   */
  public withHttpRequest(req: IncomingHttpRequest | OutgoingHttpRequest): Logger {
    const logger = new InternalLogger(this);
    const url = new URL(req.url);

    logger.modifierFunctions.push((event: Event) => {
      event.attr = event.attr || {};
      event.attr.http = {
        method: req.method,
        url: req.url,
        target: url.pathname + url.search + url.hash,
        host: url.host,
        scheme: url.protocol.slice(-1) === ":" ? url.protocol.slice(0, -1) : url.protocol,
        userAgent: req.headers?.userAgent,
        route: (req as IncomingHttpRequest).routeTemplate,
        clientIp: (req as IncomingHttpRequest).clientIp
      };
    });
    return logger;
  }

  /**
   * Return a new logger with the response attributes set.
   * @param res Incoming or Outgoing Request
   * @returns {Logger} A new Logger with the information attached
   */
  public withHttpResponse(res: HttpResponse): Logger {
    const logger = new InternalLogger(this);
    const url = new URL(res.url);
    logger.modifierFunctions.push((event: Event) => {
      event.attr = event.attr || {};
      event.attr.http = {
        statusCode: res.statusCode,
        url: res.url,
        target: url.pathname + url.search + url.hash,
        host: url.host,
        scheme: url.protocol.slice(-1) === ":" ? url.protocol.slice(0, -1) : url.protocol
      };
      if (res.serverDuration) {
        event.attr.http.server = {
          duration: res.serverDuration
        };
      }
      if (res.clientDuration) {
        event.attr.http.client = {
          duration: res.clientDuration
        };
      }
    });
    return logger;
  }

  /**
   * Return a new logger with the request attributes set.
   * @param dbReq Incoming or Outgoing Request
   * @returns {Logger} A new Logger with the information attached
   */
  public withDatabaseRequest(dbReq: DbRequest): Logger {
    const logger = new InternalLogger(this);
    logger.modifierFunctions.push((event: Event) => {
      event.attr = event.attr || {};
      event.attr.db = {
        name: dbReq.name,
        operation: dbReq.operation,
        statement: dbReq.statement,
        duration: dbReq.duration
      };
    });
    return logger;
  }

  /**
   * Return a new logger with custom attributes set.
   * @param key The name of the attributes key
   * @param value Any JSON compatible value
   * @returns {Logger} A new Logger with the information attached
   */
  public withAttributes(key: string, value: object | string | number | boolean | null): Logger {
    const logger = new InternalLogger(this);
    logger.modifierFunctions.push((event: Event) => {
      event.attr = event.attr || {};
      event.attr[key] = value;
    });
    return logger;
  }

  /**
   * Return a new logger with the exception information set.
   * @param error An error object
   * @returns A new Logger with the information attached
   */
  public withException(error: Error): Logger {
    const logger = new InternalLogger(this);
    logger.modifierFunctions.push((event: Event) => {
      event.attr = event.attr || {};
      event.attr.exception = {
        type: error.name,
        message: error.message,
        stacktrace: error.stack
      };
    });
    return logger;
  }

  private log(severity: Severity, body: string | object): void {
    const event: Event = {
      time: (new Date()).toISOString(),
      sev: severity,
      body: body
    };
    this.applyGlobalLoggingContext(event);

    for (const modifier of this.modifierFunctions) {
      try {
        modifier(event);
      } finally { /* ignore */}
    }

    const msg = JSON.stringify(event);

    if (_outputWriter) {
      if (typeof _outputWriter === "function") {
        _outputWriter(msg);
      } else {
        _outputWriter.write(msg + "\n", "utf8");
      }
    }
  }

  private applyGlobalLoggingContext(event: Event): void {
    const serviceInfos = globalLoggingContext.serviceInformation;
    if (serviceInfos) {
      event.res = {
        svc: {
          name: serviceInfos.appName,
          ver: serviceInfos.appVersion,
          inst: serviceInfos.instanceId
        }
      };
    }
  }
}

/**
 * Resets all user defined customization of the Logger, like globalLoggingContext and logWriter.
 */
export function resetLogging() {
  logger = new InternalLogger();
  globalLoggingContext.setServiceInformation("", undefined, undefined);
  setLogWriter(typeof process !== "undefined" ? process.stdout : undefined);
}

let _outputWriter: LogWriter;

/**
 * Replace the default log output (stdout) with a custom LogWriter.
 * @param writer Can be a WriteStream, WritableStream or a function with one string parameter.
 */
export function setLogWriter(writer: LogWriter): void {
  _outputWriter = writer;

}

/**
 * Returns the current LogWriter.
 * @returns Can be a WriteStream, WritableStream or a function with one string parameter.
 */
export function logWriter(): LogWriter {
  return _outputWriter;

}

/**
 * The global logger.
 */
export let logger: Logger;


resetLogging();
