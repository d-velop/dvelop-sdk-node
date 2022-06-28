import { DvelopContext } from "@dvelop-sdk/core";
import { OtelEvent, EventAttributesHttp, EventAttributesDb, EventAttributesException, OtelSeverity } from "./internal-types";
import { DvelopLogEvent, DvelopLogLevel } from "../logger/log-event";
import { ProviderFn } from "../logger/logger";
import { LoggingError } from "../error";

/**
* Indicates a problem with the OtelLoggingProvider
* @category Error
*/
export class OtelProviderError extends LoggingError {
  // eslint-disable-next-line no-unused-vars
  constructor(message: string, originalError?: Error) {
    super(message, originalError);
    Object.setPrototypeOf(this, OtelProviderError.prototype);
  }
}

/**
 * Options for the otel provider.
 */
export interface OtelProviderOptions {
  /**
   * Name of your app. Is included in every log statement.
   */
  appName: string;
  /**
   * Version string of your app. If set, it is included in every log statement.
   */
  appVersion?: string;
  /**
   * ID of the current instance of your app. If set, it is included in every log statement.
   */
  instanceId?: string;
  /**
   * Transport options for logging.
   */
  transports: ((event: any) => Promise<void>)[];
}

/**
 * Creates a new otel provider for the {@link DvelopLogger}.
 *
 * @param options Options for creating the provider
 * @param transports Transports define, where the log statements are written. Defaults to {@link otelConsoleTransport}.
 * @return A new provider for otel.
 */
export function otelProviderFactory(options: OtelProviderOptions): ProviderFn {
  if (options.transports.length === 0) {
    throw new OtelProviderError("OtelLogginProvider failed to initialize: No transports.");
  }

  return async (context: DvelopContext, event: DvelopLogEvent, level: DvelopLogLevel) => {
    const otelEvent: OtelEvent = {
      time: (new Date()).toISOString(),
      sev: mapSeverity(level),
      name: event.name,
      body: event.message,
      tn: context.tenantId,
      trace: context.traceContext?.traceId,
      span: context.traceContext?.spanId,
      res: {
        svc: {
          name: options.appName,
          ver: options.appVersion,
          inst: options.instanceId
        }
      },
      attr: hasAttributes(event) ? {
        ...event.customAttributes,
        ...mapHttpAttribute(event),
        ...mapDbAttribute(event),
        ...mapExceptionAttribute(event)
      } : undefined,
      vis: event.invisible ? 0 : 1
    };

    const otelMessage = JSON.stringify(otelEvent);

    for (const transport of options.transports) {
      transport(otelMessage);
    }
  };
}

function hasAttributes(event: DvelopLogEvent): boolean {
  return !!(event.httpIncomingRequest ||
    event.httpIncomingResponse ||
    event.httpOutgoingRequest ||
    event.httpOutgoingResponse ||
    event.dbRequest ||
    event.error ||
    event.customAttributes);
}

function mapHttpAttribute(event: DvelopLogEvent): { http?: EventAttributesHttp } {
  let attributes: EventAttributesHttp | undefined = undefined;
  if (event.httpIncomingRequest) {
    const url = new URL(event.httpIncomingRequest.url);
    attributes = {
      method: event.httpIncomingRequest.method.toUpperCase(),
      url: event.httpIncomingRequest.url,
      target: url.pathname + url.search + url.hash,
      host: url.host,
      scheme: /* istanbul ignore next */ url.protocol.slice(-1) === ":" ? url.protocol.slice(0, -1) : url.protocol,
      userAgent: event.httpIncomingRequest.headers?.userAgent,
      route: event.httpIncomingRequest.routeTemplate,
      clientIp: event.httpIncomingRequest.clientIp
    };
  } else if (event.httpIncomingResponse) {
    const url = new URL(event.httpIncomingResponse.url);
    attributes = {
      method: event.httpIncomingResponse.method.toUpperCase(),
      statusCode: event.httpIncomingResponse.statusCode,
      url: event.httpIncomingResponse.url,
      target: url.pathname + url.search + url.hash,
      host: url.host,
      scheme: /* istanbul ignore next */ url.protocol.slice(-1) === ":" ? url.protocol.slice(0, -1) : url.protocol,
      route: event.httpIncomingResponse.routeTemplate,
      server: event.httpIncomingResponse.serverDuration ? {
        duration: event.httpIncomingResponse.serverDuration
      } : undefined
    };
  } else if (event.httpOutgoingRequest) {
    const url = new URL(event.httpOutgoingRequest.url);
    attributes = {
      method: event.httpOutgoingRequest.method.toUpperCase(),
      url: event.httpOutgoingRequest.url,
      target: url.pathname + url.search + url.hash,
      host: url.host,
      scheme: /* istanbul ignore next */ url.protocol.slice(-1) === ":" ? url.protocol.slice(0, -1) : url.protocol,
      userAgent: event.httpOutgoingRequest.headers?.userAgent
    };
  } else if (event.httpOutgoingResponse) {
    const url = new URL(event.httpOutgoingResponse.url);
    attributes = {
      method: event.httpOutgoingResponse.method.toUpperCase(),
      statusCode: event.httpOutgoingResponse.statusCode,
      url: event.httpOutgoingResponse.url,
      target: url.pathname + url.search + url.hash,
      host: url.host,
      scheme: /* istanbul ignore next */ url.protocol.slice(-1) === ":" ? url.protocol.slice(0, -1) : url.protocol,
      client: event.httpOutgoingResponse.clientDuration ? {
        duration: event.httpOutgoingResponse.clientDuration
      } : undefined
    };
  }
  if (attributes) {
    return {
      http: attributes
    };
  } else {
    return {};
  }
}

function mapDbAttribute(event: DvelopLogEvent): { db?: EventAttributesDb } {
  if (event.dbRequest) {
    return {
      db: {
        name: event.dbRequest.name,
        operation: event.dbRequest.operation,
        statement: event.dbRequest.statement,
        duration: event.dbRequest.duration
      }
    };
  } else {
    return {};
  }
}

function mapExceptionAttribute(event: DvelopLogEvent): { exception?: EventAttributesException } {
  if (event.error) {
    return {
      exception: {
        message: event.error.message,
        type: event.error.name,
        stacktrace: event.error.stack
      }
    };
  } else {
    return {};
  }
}

function mapSeverity(level: DvelopLogLevel): OtelSeverity {
  switch (level) {
  case "debug":
    return OtelSeverity.DEBUG1;
  case "info":
    return OtelSeverity.INFO1;
  case "error":
    return OtelSeverity.ERROR1;
  default:
    return 0;
  }
}
