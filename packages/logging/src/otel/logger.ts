import { DvelopContext } from "@dvelop-sdk/core";
import { globalLoggingContext } from "./context";
import { DbRequest, HttpResponse, IncomingHttpRequest, OutgoingHttpRequest } from "../types/public";
import { Event, Severity, LogWriter } from "../types/private";

export class Logger {

  private readonly modifierFunctions: ((event: Event) => void)[];

  constructor(logger?: Logger) {
    this.modifierFunctions = logger ? [...logger.modifierFunctions] : [];
  }

  public debug(body: string | object): void {
    this.log(Severity.Debug, body);
  }

  public info(body: string | object): void {
    this.log(Severity.Info, body);
  }

  public warn(body: string | object): void {
    this.log(Severity.Warn, body);
  }

  public error(body: string | object): void {
    this.log(Severity.Error, body);
  }

  public exception(error: Error): void {
    logger.withException(error).error(`${error.name}: ${error.message}`);
  }

  public withCtx(context: DvelopContext): Logger {
    const logger = new Logger(this);
    logger.modifierFunctions.push((event: Event) => {
      event.tn = context.tenantId;
      event.trace = context.traceId;
      event.span = context.spanId;
    });
    return logger;
  }

  public withName(name: string): Logger {
    const logger = new Logger(this);
    logger.modifierFunctions.push((event: Event) => {
      event.name = name;
    });
    return logger;
  }

  public withInvisibility(): Logger {
    const logger = new Logger(this);
    logger.modifierFunctions.push((event: Event) => {
      event.vis = 0;
    });
    return logger;
  }

  public withHttpRequest(req: IncomingHttpRequest | OutgoingHttpRequest): Logger {
    const logger = new Logger(this);
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

  public withHttpResponse(res: HttpResponse): Logger {
    const logger = new Logger(this);
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

  public withDatabaseRequest(dbReq: DbRequest): Logger {
    const logger = new Logger(this);
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

  public withAttributes(key: string, value: object | string | number | boolean | null): Logger {
    const logger = new Logger(this);
    logger.modifierFunctions.push((event: Event) => {
      event.attr = event.attr || {};
      event.attr[key] = value;
    });
    return logger;
  }

  public withException(error: Error): Logger {
    const logger = new Logger(this);
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

export function resetLogging() {
  logger = new Logger();
  globalLoggingContext.setServiceInformation("", undefined, undefined);
  setLogWriter(typeof process !== "undefined" ? process.stdout : undefined);
}

let _outputWriter: LogWriter;

export function setLogWriter(writer: LogWriter): void {
  _outputWriter = writer;

}
export function logWriter(): LogWriter {
  return _outputWriter;

}
export let logger: Logger;


resetLogging();
