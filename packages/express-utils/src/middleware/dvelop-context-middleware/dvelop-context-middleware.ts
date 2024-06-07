import {
  DVELOP_REQUEST_ID_HEADER,
  DVELOP_REQUEST_SIGNATURE_HEADER,
  DVELOP_SYSTEM_BASE_URI_HEADER,
  DVELOP_TENANT_ID_HEADER,
  TRACEPARENT_HEADER,
  TraceContext,
  parseTraceparentHeader,
  generateTraceContext
} from "@dvelop-sdk/core";

import { Request, Response, NextFunction } from "express";

/**
 * Factory for the {@link contextMiddleware}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category Core
 */
export function contextMiddlewareFactory(
  parseTraceparentHeader: (traceparentHeader: string) => TraceContext,
  generateTraceContext: () => TraceContext,
  systemBaseUri?: string,
  tenantId?: string
): (req: Request, _: Response, next: NextFunction) => void {

  return (req: Request, _: Response, next: NextFunction) => {

    if (systemBaseUri) {
      req.dvelopContext = {
        systemBaseUri: systemBaseUri,
        tenantId: tenantId || req.header(DVELOP_TENANT_ID_HEADER),
        requestId: req.header(DVELOP_REQUEST_ID_HEADER)
      }
    } else {
      req.dvelopContext = {
        systemBaseUri: req.header(DVELOP_SYSTEM_BASE_URI_HEADER),
        tenantId: req.header(DVELOP_TENANT_ID_HEADER),
        requestId: req.header(DVELOP_REQUEST_ID_HEADER),
        requestSignature: req.header(DVELOP_REQUEST_SIGNATURE_HEADER),
      };
    }

    const traceparentHeader = req.header(TRACEPARENT_HEADER);

    if (traceparentHeader) {
      try {
        req.dvelopContext.traceContext = parseTraceparentHeader(traceparentHeader);
      } catch (e: any) {
        req.dvelopContext.traceContext = generateTraceContext();
      }
    } else {
      req.dvelopContext.traceContext = generateTraceContext();
    }

    next();
  };
}

/**
 * Sets a {@link DvelopContext} to the express-request-object. Accessable via the ```req.dvelopContext```-property.
 *
 * ```typescript
 * import { contextMiddleware } from "@dvelop-sdk/express-utils";
 *
 * app.use(contextMiddleware);
 *
 * app.use((req: Request, _: Response, next: NextFunction) => {
 *   console.log(req.dvelopContext);
 *   next();
 * });
 * ```
 *
 * @category Middleware
 */
/* istanbul ignore next */
export function contextMiddleware(req: Request, _: Response, next: NextFunction): void {
  return contextMiddlewareFactory(parseTraceparentHeader, generateTraceContext)(req, _, next);
}

/**
 * Sets a {@link DvelopContext} to the express-request-object. Accessable via the ```req.dvelopContext```-property.
 * This is a version with a fixed systemBaseUri, primarily used on premise.
 *
 * ```typescript
 * import { contextMiddlewareFactoryWithFixedSystemBaseUri } from "@dvelop-sdk/express-utils";
 *
 * app.use(contextMiddlewareFactoryWithFixedSystemBaseUri("https://my.local.baseuri")); //could optionally supply a tenantId (default: 0)
 *
 * app.use((req: Request, _: Response, next: NextFunction) => {
 *   console.log(req.dvelopContext);
 *   next();
 * });
 * ```
 *
 * @category Middleware
 */
/* istanbul ignore next */
export function contextMiddlewareFactoryWithFixedSystemBaseUri(systemBaseUri: string, tenantId: string = "0") {
  return (req: Request, _: Response, next: NextFunction) => {
    return contextMiddlewareFactory(parseTraceparentHeader, generateTraceContext, systemBaseUri, tenantId)(req, _, next);
  }
}
