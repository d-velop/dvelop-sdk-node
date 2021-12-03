import { DvelopContext, DVELOP_REQUEST_ID_HEADER, DVELOP_REQUEST_SIGNATURE_HEADER, DVELOP_SYSTEM_BASE_URI_HEADER, DVELOP_TENANT_ID_HEADER } from "@dvelop-sdk/core";
import { validateDvelopContext as _validateDvelopContextDefaultFunction } from "@dvelop-sdk/app-router";
import { Request, Response, NextFunction } from "express";
import "../../index";

/**
 * Extract the {@link DvelopContext}-information from the express {@link Request} object.
 * @internal
 * @category Middleware
 */
export function _getDvelopContextFromRequestDefaultFunction(request: Request): DvelopContext {
  return {
    systemBaseUri: request.header(DVELOP_SYSTEM_BASE_URI_HEADER),
    tenantId: request.header(DVELOP_TENANT_ID_HEADER),
    requestId: request.header(DVELOP_REQUEST_ID_HEADER),
    requestSignature: request.header(DVELOP_REQUEST_SIGNATURE_HEADER)
  };
}

/**
 * Validate the requestSignature given by the App-Router against your appSecret.
 *
 * **The requestSignature should be validated for every request when recieving calls from the d.velop cloud.
 * Refer to the [d.velop basics tenant header section](https://developer.d-velop.de/dev/en/basics#tenant-header) for more information.**
 *
 * @throws {@link InvalidRequestSignatureError} Indicates the requestSignature was invalid, meaning that either the request was not submitted by the appRouter or there is a problem with your secret.
 *
 * TODO: @example
 *
 * @category Middleware
 */
export function dvelopContextMiddlewareFactory(
  appSecret: string,
  getDvelopContextFromRequest: (request: Request) => DvelopContext = _getDvelopContextFromRequestDefaultFunction,
  validateDvelopContext: (appSecret: string, context: DvelopContext) => void = _validateDvelopContextDefaultFunction
): (request: Request, response: Response, next: NextFunction) => void {
  return (request: Request, _: Response, next: NextFunction) => {
    const context: DvelopContext = getDvelopContextFromRequest(request);
    validateDvelopContext(appSecret, context);
    request.dvelopContext = context;
    next();
  };
}
