import { Request, Response, NextFunction } from "express";
import { validateCloudCenterEventSignature as _validateCloudCenterEventSignatureDefaultFunction } from "@dvelop-sdk/app-router";
import { ValidateCloudCenterEventSignatureParams } from "@dvelop-sdk/app-router/lib/validate-cloud-center-event-signature/validate-cloud-center-event-signature";

/**
 * Validate the cloud-center-event signature against your appSecret.
 *
 * **The cloud-center-event signature should be validated for every request when recieving events from the d.velop cloud-center.
 * Refer to the [d.velop cloud center API](https://developer.d-velop.de/documentation/ccapi/en) for more information.**
 *
 * ```typescript
 * import { validateCloudCenterEventSignatureMiddlewareFactory } from "@dvelop-sdk/express-utils";
 *
 * app.use("/some/route/dvelop-cloud-lifecycle-event", validateSignatureMiddlewareFactory(process.env.APP_SECRET));
 * ```
 * @category Middleware
 */
export function validateCloudCenterEventSignatureMiddlewareFactory(
  appSecret: string
): (request: Request, response: Response, next: NextFunction) => void;

/**
 * Validate the cloud-center-event signature against your appSecret. You can supply a custom validate-function.
 *
 * @internal
 * @category Middleware
 */
export function validateCloudCenterEventSignatureMiddlewareFactory(
  appSecret: string,
  validateCloudCenterEventSignature: (appSecret: string, params: ValidateCloudCenterEventSignatureParams) => void
): (request: Request, response: Response, next: NextFunction) => void;

export function validateCloudCenterEventSignatureMiddlewareFactory(
  appSecret: string,
  validateCloudCenterEventSignature: (appSecret: string, params: ValidateCloudCenterEventSignatureParams) => void = _validateCloudCenterEventSignatureDefaultFunction
): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, _: Response, next: NextFunction) => {

    const query_index = req.originalUrl.indexOf("?");
    const queryString: string = (query_index >= 0) ? req.originalUrl.slice(query_index + 1) : "";

    const cloudCenterEventSignature: string = req.headers["authorization"]?.split(" ")[1] || "";

    const headers: { [key: string]: string | undefined } = {};

    Object.keys(req.headers).forEach(h => {
      if (Array.isArray(req.headers[h])) {
        headers[h] = (req.headers[h] as string[]).join(", ");
      } else {
        headers[h] = req.headers[h] as string;
      }
    });

    validateCloudCenterEventSignature(appSecret, {
      httpMethod: req.method,
      resourcePath: req.path,
      queryString: queryString,
      headers: headers,
      payload: req.body,
      cloudCenterEventSignature: cloudCenterEventSignature
    });

    next();
  };
}