import { DVELOP_REQUEST_ID_HEADER, DVELOP_REQUEST_SIGNATURE_HEADER, DVELOP_SYSTEM_BASE_URI_HEADER, DVELOP_TENANT_ID_HEADER } from "@dvelop-sdk/core";
import { Request, Response, NextFunction } from "express";

/**
 * Sets a {@link DvelopContext} to the express-request-object. Accessable via the ```req.dvelopContext```-property.
 *
 * ```typescript
 * import { contextMiddleware } from "@dvelop-sdk/express-utils";
 *
 * app.use(contextMiddleware);
 * ```
 *
 * @category Middleware
 */
export function contextMiddleware(req: Request, _: Response, next: NextFunction): void {
  req.dvelopContext = {
    systemBaseUri: req.header(DVELOP_SYSTEM_BASE_URI_HEADER),
    tenantId: req.header(DVELOP_TENANT_ID_HEADER),
    requestId: req.header(DVELOP_REQUEST_ID_HEADER),
    requestSignature: req.header(DVELOP_REQUEST_SIGNATURE_HEADER)
  };
  next();
}
