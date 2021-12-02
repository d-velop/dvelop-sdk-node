import { NextFunction, Request, Response } from "express";
import { DvelopContext } from "@dvelop-sdk/core";
import { DvelopUser, validateAuthSessionId as _validateAuthSessionIdDefaultFunction } from "@dvelop-sdk/identityprovider";

export function _getAuthSessionIdDefaultFunction(request: Request): string | undefined {

  const authorizationHeader: string | undefined = request.get("Authorization");
  if (authorizationHeader) {
    const matches: RegExpExecArray | null = new RegExp(/^bearer (.*)$/, "i").exec(authorizationHeader);
    return matches ? matches[1] : undefined;
  }

  if (request.cookies && request.cookies["AuthSessionId"]) {
    return request.cookies["AuthSessionId"];
  }

  return undefined;
}

export function _dvelopAuthenticationMiddlewareFactory(
  getAuthSessionId: (request: Request) => string | undefined,
  validateAuthSessionId: (context: DvelopContext) => Promise<DvelopUser>
): (request: Request, _: Response, next: NextFunction) => Promise<void> {

  return async (request: Request, _: Response, next: NextFunction) => {

    if (!request.dvelopContext) {
      request.dvelopContext = {};
    }

    if (!request.dvelopContext.authSessionId) {
      request.dvelopContext.authSessionId = getAuthSessionId(request);
    }

    const user: DvelopUser = await validateAuthSessionId(request.dvelopContext);
    request.dvelopContext.user = user;
    next();
  };
}

/* istanbul ignore next */
export async function dvelopAuthenticationMiddleware(request: Request, response: Response, next: NextFunction): Promise<void> {
  return await _dvelopAuthenticationMiddlewareFactory(_getAuthSessionIdDefaultFunction, _validateAuthSessionIdDefaultFunction)(request, response, next);
}