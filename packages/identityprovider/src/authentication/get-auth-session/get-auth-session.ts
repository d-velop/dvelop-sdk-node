import { DvelopContext } from "../../../../core/lib";
import { HttpConfig, HttpResponse, _defaultHttpRequestFunction } from "../../utils/http";

/**
 * Used for authentication in the d.velop cloud. Refer to the [documentation](https://developer.d-velop.de/documentation/idpapi/en/identityprovider-app-201523580.html#validating-the-login) for further information.
 * @category Authentication
 */
export interface AuthSession {

  /**
   * This key will validate your requests (usually sent as Bearer-Token). **The AuthSessionId should be kept secret and never be publicly available**
   */
  id: string;


  /**
   * Date at which the AuthSessionId will no longer be valid.
   */
  expire: Date;
}

/**
 * Default transform-function provided to the {@link getAuthSession}-function.
 * @internal
 * @category Authentication
 */
export function _getAuthSessionDefaultTransformFunction(response: HttpResponse, _: DvelopContext): AuthSession {
  return {
    id: response.data.AuthSessionId,
    expire: new Date(response.data.Expire)
  };
}

/**
 * Factory for the {@link getAuthSession}-function. See internals for more information.
 * @typeparam T Return type of the {@link getAuthSession}-function. A corresponding transformFuntion has to be supplied.
 * @internal
 * @category Authentication
 */
export function _getAuthSessionFactory<T>(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: DvelopContext) => T,
): (context: DvelopContext) => Promise<T> {
  return async (context: DvelopContext) => {
    const response: HttpResponse = await httpRequestFunction(context, {
      method: "GET",
      url: "/identityprovider",
      follows: ["login"],
    });
    return transformFunction(response, context);
  };
}

/**
 * Returns an [AuthSession]{@link AuthSession} based on an API-Key. API-Keys can be generated by d.velop cloud tenant administrators.
 * **The AuthSessionId should be kept secret and never be publicly available.**
 *
 * @category Authentication
 *
 * @example ```typescript
 * //TODO
 * ```
 *
 */
/* istanbul ignore next */
export async function getAuthSession(context: DvelopContext): Promise<AuthSession> {
  return _getAuthSessionFactory(_defaultHttpRequestFunction, _getAuthSessionDefaultTransformFunction)(context);
}