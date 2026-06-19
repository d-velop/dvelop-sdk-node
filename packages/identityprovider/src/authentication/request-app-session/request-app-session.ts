import { DvelopContext, DvelopOptions, dvelopFetch } from "@dvelop-sdk/core";
import { ensureSuccessResponse } from "../../utils/identityprovider-error";

/**
 * Parameters for the {@link requestAppSession}-function.
 * @category Authentication
 */
export interface RequestAppSessionParams {
  /** Name of the app requesting the appSession */
  appName: string;
  /** Relative URI to which the appSession will be sent via POST */
  callback: string;
}

/**
 * Default `onResponse` provided to the {@link requestAppSession}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category Authentication
 */
export async function onResponse(response: Response): Promise<void> {
  await ensureSuccessResponse(response);
}

/**
 * Request an appSession for your app. The appSession will be sent via POST to your defined callback.
 * **Do not forget to validate the appSessionId via the {@link validateAppSessionSignature}-function**
 *
 * ```typescript
 * import { requestAppSession } from "@dvelop-sdk/identityprovider";
 *
 * await requestAppSession({
 *   systemBaseUri: "https://monster-ag.d-velop.cloud",
 *   authSessionId: "dQw4w9WgXcQ"
 * }, {
 *   appName: "cda-compliance",
 *   callback: "/cda-compliance/appsession"
 * });
 * ```
 * @category Authentication
 */
export async function requestAppSession(context: DvelopContext, params: RequestAppSessionParams): Promise<void>;
export async function requestAppSession<T>(context: DvelopContext, params: RequestAppSessionParams, options: DvelopOptions<T>): Promise<T>;
export async function requestAppSession<T>(
  context: DvelopContext,
  params: RequestAppSessionParams,
  options: DvelopOptions<T | void> = {
    onResponse: onResponse
  }
): Promise<T | void> {
  return dvelopFetch(context, "/identityprovider/appsession", {
    method: "POST",
    body: JSON.stringify({
      appname: params.appName,
      callback: params.callback,
      requestid: context.requestId
    })
  }, options);
}
