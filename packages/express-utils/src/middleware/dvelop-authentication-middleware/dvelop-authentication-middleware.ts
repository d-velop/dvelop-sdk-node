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
export function _getAuthSessionIdFromRequestDefaultFunction(req: Request): string | undefined {

  const authorizationHeader: string | undefined = req.get("Authorization");
  if (authorizationHeader) {
    const matches: RegExpExecArray | null = new RegExp(/^bearer (.*)$/, "i").exec(authorizationHeader);
    return matches ? matches[1] : undefined;
  }

  if (req.cookies && req.cookies["AuthSessionId"]) {
    return req.cookies["AuthSessionId"];
  }

  return undefined;
}

/**
 * Factory for the {@link authenticationMiddleware}-function.
 *
 * @internal
 * @category Middleware
 */
export function _authenticationMiddlewareFactory(
  getAuthSessionId: (req: Request) => string | undefined,
  validateAuthSessionId: (context: DvelopContext) => Promise<DvelopUser>
): (req: Request, _: Response, next: NextFunction) => Promise<void> {

  return async (req: Request, _: Response, next: NextFunction) => {

    if (!req.dvelopContext) {
      req.dvelopContext = {};
    }

    if (!req.dvelopContext.authSessionId) {
      req.dvelopContext.authSessionId = getAuthSessionId(req);
    }

    let user: DvelopUser;
    try {
      user = await validateAuthSessionId(req.dvelopContext);
      req.dvelopContext.user = user;
      next();
    } catch (err: any) {
      next(err);
    }
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
export async function authenticationMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  return await _authenticationMiddlewareFactory(_getAuthSessionIdFromRequestDefaultFunction, _validateAuthSessionIdDefaultFunction)(req, res, next);
}