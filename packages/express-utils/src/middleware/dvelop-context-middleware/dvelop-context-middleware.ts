import { DVELOP_REQUEST_ID_HEADER, DVELOP_REQUEST_SIGNATURE_HEADER, DVELOP_SYSTEM_BASE_URI_HEADER, DVELOP_TENANT_ID_HEADER } from "@dvelop-sdk/core";
import { Request, Response, NextFunction } from "express";

/**
 * Sets a {@link DvelopContext} to the express-request-object. Accessable via the ```dvelopContext```-property.
 *
 * ```typescript
 * //TODO
 * ```
 *
 * @category Middleware
 */
export function dvelopContextMiddleware(request: Request, _: Response, next: NextFunction): void {
  request.dvelopContext = {
    systemBaseUri: request.header(DVELOP_SYSTEM_BASE_URI_HEADER),
    tenantId: request.header(DVELOP_TENANT_ID_HEADER),
    requestId: request.header(DVELOP_REQUEST_ID_HEADER),
    requestSignature: request.header(DVELOP_REQUEST_SIGNATURE_HEADER)
  };
  next();
}
