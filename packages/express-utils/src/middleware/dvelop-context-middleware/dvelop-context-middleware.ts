import { DvelopContext, DVELOP_REQUEST_ID_HEADER, DVELOP_REQUEST_SIGNATURE_HEADER, DVELOP_SYSTEM_BASE_URI_HEADER, DVELOP_TENANT_ID_HEADER } from "@dvelop-sdk/core";
import { validateDvelopContext as _validateDvelopContextDefaultFunction } from "@dvelop-sdk/app-router";
import { Request, Response, NextFunction } from "express";
import "../../index";

export function _getDvelopContextFromRequestDefaultFunction(request: Request): DvelopContext {
  return {
    systemBaseUri: request.header(DVELOP_SYSTEM_BASE_URI_HEADER),
    tenantId: request.header(DVELOP_TENANT_ID_HEADER),
    requestId: request.header(DVELOP_REQUEST_ID_HEADER),
    requestSignature: request.header(DVELOP_REQUEST_SIGNATURE_HEADER)
  };
}

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
