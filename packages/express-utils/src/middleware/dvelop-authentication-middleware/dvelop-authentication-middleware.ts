import "../../index";
import { NextFunction, Request, Response } from "express";
import { DvelopContext } from "@dvelop-sdk/core";
import { DvelopUser, validateAuthSessionId as _validateAuthSessionIdDefaultFunction } from "@dvelop-sdk/identityprovider";

/**
 * Extract the authSessionId from express {@link Request}. See [the documentation](https://developer.d-velop.de/documentation/idpapi/en) for further information.
 *
 * @internal
 * @category Middleware
 */
export function _getAuthSessionIdFromRequestDefaultFunction(request: Request): string | undefined {

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

/**
 * Factory for the {@link dvelopAuthenticationMiddleware}-function.
 *
 * @internal
 * @category Middleware
 */
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

/**
 * Authenticate an authSessionId by sending it to the Identityprovder-App. In case of success a {@link DvelopUser} object will be available in the ```request.dvelopContext.user```-property.
 *
 * **If the authSessionId is not validated data is anonimously available on the internet.**
 * @throws {@link UnauthorizedError}
 *
 * ```typescript
 * //TODO
 * ```
 *
 * @category Middleware
 */
/* istanbul ignore next */
export async function dvelopAuthenticationMiddleware(request: Request, response: Response, next: NextFunction): Promise<void> {
  return await _dvelopAuthenticationMiddlewareFactory(_getAuthSessionIdFromRequestDefaultFunction, _validateAuthSessionIdDefaultFunction)(request, response, next);
}