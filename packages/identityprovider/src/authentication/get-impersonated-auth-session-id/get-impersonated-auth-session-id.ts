import { DvelopContext } from "@dvelop-sdk/core";
import { HttpConfig, HttpResponse, _defaultHttpRequestFunction } from "../../utils/http";

/**
 * Parameters for the {@link getImpersonatedAuthSessionId}-function.
 * @category Authentication
 */
export interface GetImpersonatedAuthSessionIdParams {
  userId: string;
}

/**
 * Default transform-function provided to the {@link getImpersontedAuthSessionId}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category Authentication
 */
export function _getImpersonatedAuthSessionIdDefaultTransformFunction(response: HttpResponse, _: DvelopContext, __: GetImpersonatedAuthSessionIdParams): string {
  return response.data.authSessionId;
}

/**
 * Factory for the {@link getImpersonatedAuthSessionId}}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @typeparam T Return type of the {@link getImpersonatedAuthSessionId}-function. A corresponding transformFuntion has to be supplied.
 * @internal
 * @category Authentication
 */
export function _getImpersonatedAuthSessionIdFactory<T>(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: DvelopContext, params: GetImpersonatedAuthSessionIdParams) => T,
): (context: DvelopContext, params: GetImpersonatedAuthSessionIdParams) => Promise<T> {
  return async (context: DvelopContext, params: GetImpersonatedAuthSessionIdParams) => {
    const response: HttpResponse = await httpRequestFunction(context, {
      method: "GET",
      url: "/identityprovider/impersonatesession",
      params: {
        userId: params.userId
      }
    });
    return transformFunction(response, context, params);
  };
}

/**
 * Returns an authSessionId for the given user. All requests with this authSessionId will be in that users name.
 * **The AuthSessionId should be kept secret and never be publicly available.**
 *
 * ```typescript
 *  import { getImpersonatedAuthSessionId } from "@dvelop-sdk/identityprovider";
 *
 * const authSessionId = await getImpersonatedAuthSessionId({
 *   systemBaseUri: "https://monster-ag.d-velop.cloud",
 *   authSessionId: "dQw4w9WgXcQ" // has to be an AppSession
 * }, {
 *   userId: "XiFkyR35v2Y"
 * });
 *
 * console.log(authSessionId);
 * ```
 * @category Authentication
 */
/* istanbul ignore next */
export async function getImpersonatedAuthSessionId(context: DvelopContext, params: GetImpersonatedAuthSessionIdParams): Promise<string> {
  return _getImpersonatedAuthSessionIdFactory(_defaultHttpRequestFunction, _getImpersonatedAuthSessionIdDefaultTransformFunction)(context, params);
}