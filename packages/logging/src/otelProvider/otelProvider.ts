import { DvelopContext } from "@dvelop-sdk/core";
import { OtelEvent, EventAttributesHttp, EventAttributesDb, EventAttributesException, OtelSeverity } from "./internal-types";
import { DvelopLogEvent, ProviderFn, Severity } from "../logger/log-event";

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
}

/**
 * The type to use for custom transport functions.
 */
export type OtelProviderTransport = (otelMessage: string) => void;

/* istanbul ignore next */
/**
 * This transport functions prints every log statement to stdout (when used in node.js)
 * or to the console (when used in the browser).
 *
 * The default transport, if no transport is defined in the {@link otelProviderFactory} function.
 */
export const otelConsoleTransport: OtelProviderTransport = (otelMessage) => {
  if (process?.stdout) {
    process.stdout.write(`${otelMessage}\n`);
  } else {
    // eslint-disable-next-line no-console
    console.log(otelMessage);
  }
};

/**
 * Creates a new otel provider for the {@link DvelopLogger}.
 *
 * @param providerOptions Options for creating the provider
 * @param transports Transports define, where the log statements are written. Defaults to {@link otelConsoleTransport}.
 * @return A new provider for otel.
 */
export function otelProviderFactory(providerOptions: OtelProviderOptions, transports: OtelProviderTransport[] = []): ProviderFn {
  if (!transports || transports.length === 0) {
    transports = [otelConsoleTransport];
  }

  return (context: DvelopContext, severity: Severity, event: DvelopLogEvent) => {
    const otelEvent: OtelEvent = {
      time: (new Date()).toISOString(),
      sev: mapSeverity(severity),
      name: event.name,
      body: event.message,
      tn: context.tenantId,
      trace: context.traceContext?.traceId,
      span: context.traceContext?.spanId,
      res: {
        svc: {
          name: providerOptions.appName,
          ver: providerOptions.appVersion,
          inst: providerOptions.instanceId
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

    for (const transport of transports) {
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

function mapSeverity(severity: Severity): OtelSeverity {
  switch (severity) {
  case Severity.debug:
    return OtelSeverity.DEBUG1;
  case Severity.info:
    return OtelSeverity.INFO1;
  case Severity.warn:
    return OtelSeverity.WARN1;
  case Severity.error:
    return OtelSeverity.ERROR1;
  }
}
