import { Request, Response } from "express";
import { getLoginRedirectionUri as _getLoginRedirectionUriDefaultFunction } from "@dvelop-sdk/identityprovider";

/**
 * Factory for the {@link redirectToLoginPage}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 *
 * @internal
 */
export function _redirectToLoginPageFactory(getLoginRedirectionUri: (sucessUri: string) => string): (req: Request, res: Response) => void {
  return (req: Request, res: Response) => {
    res.redirect(getLoginRedirectionUri(req.originalUrl));
  };
}

/**
 * Redirect a request to the login page provided by the Identityprovider-App.
 *
 * ```typescript
 * import { redirectToLoginPage, UnauthorizedError } from "@dvelop-sdk/express-utils";
 *
 * app.use((err, req, res, next) => {
 *   if (err instanceof UnauthorizedError && req.accepts("text/html")) {
 *     redirectToLoginPage(req, res);
 *   } else {
 *     res.status(401).send("Unauhtorized") // For Content-Types such as JSON return a 401 - Unauthorized
 *   }
 * });
 * ```
 */
/* istanbul ignore next */
export function redirectToLoginPage(req: Request, res: Response) {
  _redirectToLoginPageFactory(_getLoginRedirectionUriDefaultFunction)(req, res);
}