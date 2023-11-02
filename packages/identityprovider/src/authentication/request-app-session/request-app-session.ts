import { DvelopContext } from "../../../../core/lib";
import { HttpConfig, HttpResponse, _defaultHttpRequestFunction } from "../../utils/http";

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
 * Factory for the {@link requestAppSession}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @typeparam T Return type of the {@link requestAppSession}-function. A corresponding transformFunction has to be supplied.
 * @category Authentication
 */
export function _requestAppSessionFactory<T>(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: DvelopContext, params: RequestAppSessionParams) => T,
): (context: DvelopContext, params: RequestAppSessionParams) => Promise<T> {

  return async (context: DvelopContext, params: RequestAppSessionParams) => {

    const response = await httpRequestFunction(context, {
      method: "POST",
      url: "/identityprovider/appsession",
      data: {
        appname: params.appName,
        callback: params.callback,
        requestid: context.requestId
      }
    });

    return transformFunction(response, context, params);
  };
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
/* istanbul ignore next */
export async function requestAppSession(context: DvelopContext, params: RequestAppSessionParams): Promise<void> {
  return await _requestAppSessionFactory(_defaultHttpRequestFunction, () => { })(context, params);
}