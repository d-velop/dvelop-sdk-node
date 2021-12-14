import "../../index";
import { Request, Response, NextFunction } from "express";
import { DvelopContext, DvelopSdkError } from "@dvelop-sdk/core";
import { validateDvelopContext as _validateDvelopContextDefaultFunction } from "@dvelop-sdk/app-router";

/**
 * Validate the requestSignature against the requestData your appSecret.
 * Requires the ```dvelopContext```-propertiy to be set. See {@link dvelopContextMiddleware}.
 *
 * **The requestSignature should be validated for every request when recieving calls from the d.velop cloud.
 * Refer to the [d.velop basics tenant header section](https://developer.d-velop.de/dev/en/basics#tenant-header) for more information.**
 *
 * ```typescript
 * import { validateSignatureMiddlewareFactory } from "@dvelop-sdk/express-utils";
 *
 * app.use(validateSignatureMiddlewareFactory(process.env.APP_SECRET));
 * ```
 * @category Middleware
 */
export function validateSignatureMiddlewareFactory(
  appSecret: string
): (request: Request, response: Response, next: NextFunction) => void;

/**
 * Validate the requestSignature against the requestData your appSecret. You can supply a custom validate-function.
 *
 * @internal
 * @category Middleware
 */
export function validateSignatureMiddlewareFactory(
  appSecret: string,
  validateDvelopContext: (appSecret: string, context: DvelopContext) => void
): (request: Request, response: Response, next: NextFunction) => void;
export function validateSignatureMiddlewareFactory(
  appSecret: string,
  validateDvelopContext: (appSecret: string, context: DvelopContext) => void = _validateDvelopContextDefaultFunction
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, _: Response, next: NextFunction) => {
    if (!req.dvelopContext) {
      throw new DvelopSdkError("ValidateSignatureMiddleware requires dvelopContext-property to be set.");
    }
    validateDvelopContext(appSecret, req.dvelopContext);
    next();
  };
}