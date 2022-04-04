import { DvelopContext } from "@dvelop-sdk/core";
import { Event, EventAttributesHttp, EventAttributesDb, EventAttributesException, OtelSeverity } from "./internal-types";
import { LogOptions, ProviderFn, Severity } from "../logger/types";

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

  return (context: DvelopContext, severity: Severity, options: LogOptions) => {
    const event: Event = {
      time: (new Date()).toISOString(),
      sev: mapSeverity(severity),
      name: options.name,
      body: options.message,
      tn: context.tenantId,
      trace: context.traceId,
      span: context.spanId,
      res: {
        svc: {
          name: providerOptions.appName,
          ver: providerOptions.appVersion,
          inst: providerOptions.instanceId
        }
      },
      attr: hasAttributes(options) ? {
        ...options.customAttributes,
        ...mapHttpAttribute(options),
        ...mapDbAttribute(options),
        ...mapExceptionAttribute(options)
      } : undefined,
      vis: options.invisible ? 0 : 1
    };

    const otelMessage = JSON.stringify(event);

    for (const transport of transports) {
      transport(otelMessage);
    }
  };
}

function hasAttributes(options: LogOptions): boolean {
  return !!(options.httpIncomingRequest ||
    options.httpIncomingResponse ||
    options.httpOutgoingRequest ||
    options.httpOutgoingResponse ||
    options.dbRequest ||
    options.error ||
    options.customAttributes);
}

function mapHttpAttribute(options: LogOptions): {http?: EventAttributesHttp} {
  let attributes: EventAttributesHttp | undefined = undefined;
  if (options.httpIncomingRequest) {
    const url = new URL(options.httpIncomingRequest.url);
    attributes = {
      method: options.httpIncomingRequest.method.toUpperCase(),
      url: options.httpIncomingRequest.url,
      target: url.pathname + url.search + url.hash,
      host: url.host,
      scheme: /* istanbul ignore next */ url.protocol.slice(-1) === ":" ? url.protocol.slice(0, -1) : url.protocol,
      userAgent: options.httpIncomingRequest.headers?.userAgent,
      route: options.httpIncomingRequest.routeTemplate,
      clientIp: options.httpIncomingRequest.clientIp
    };
  } else if (options.httpIncomingResponse) {
    const url = new URL(options.httpIncomingResponse.url);
    attributes = {
      method: options.httpIncomingResponse.method.toUpperCase(),
      statusCode: options.httpIncomingResponse.statusCode,
      url: options.httpIncomingResponse.url,
      target: url.pathname + url.search + url.hash,
      host: url.host,
      scheme: /* istanbul ignore next */ url.protocol.slice(-1) === ":" ? url.protocol.slice(0, -1) : url.protocol,
      route: options.httpIncomingResponse.routeTemplate,
      client: options.httpIncomingResponse.clientDuration ? {
        duration: options.httpIncomingResponse.clientDuration
      } : undefined
    };
  } else if (options.httpOutgoingRequest) {
    const url = new URL(options.httpOutgoingRequest.url);
    attributes = {
      method: options.httpOutgoingRequest.method.toUpperCase(),
      url: options.httpOutgoingRequest.url,
      target: url.pathname + url.search + url.hash,
      host: url.host,
      scheme: /* istanbul ignore next */ url.protocol.slice(-1) === ":" ? url.protocol.slice(0, -1) : url.protocol,
      userAgent: options.httpOutgoingRequest.headers?.userAgent
    };
  } else if (options.httpOutgoingResponse) {
    const url = new URL(options.httpOutgoingResponse.url);
    attributes = {
      method: options.httpOutgoingResponse.method.toUpperCase(),
      statusCode: options.httpOutgoingResponse.statusCode,
      url: options.httpOutgoingResponse.url,
      target: url.pathname + url.search + url.hash,
      host: url.host,
      scheme: /* istanbul ignore next */ url.protocol.slice(-1) === ":" ? url.protocol.slice(0, -1) : url.protocol,
      server: options.httpOutgoingResponse.serverDuration ? {
        duration: options.httpOutgoingResponse.serverDuration
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

function mapDbAttribute(options: LogOptions): {db?: EventAttributesDb} {
  if (options.dbRequest) {
    return {
      db: {
        name: options.dbRequest.name,
        operation: options.dbRequest.operation,
        statement: options.dbRequest.statement,
        duration: options.dbRequest.duration
      }
    };
  } else {
    return {};
  }
}

function mapExceptionAttribute(options: LogOptions): {exception?: EventAttributesException} {
  if (options.error) {
    return {
      exception: {
        message: options.error.message,
        type: options.error.name,
        stacktrace: options.error.stack
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
