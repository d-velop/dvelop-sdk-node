import { DvelopContext } from "../../../../core/lib";
import { HttpConfig, HttpResponse, _defaultHttpRequestFunction } from "../../utils/http";

/**
 * User representation according to the [System for Cross-domain Identity Management (SCIM)]{@link https://tools.ietf.org/html/rfc7644}.
 * @category Authentication
 */
export interface DvelopUser {

  /** Unique UserId */
  id?: string;

  /** Technical username */
  userName?: string;

  /** Name object containg family name and given name */
  name?: {
    familyName?: string;
    givenName?: string;
  };

  /** Display name assigned by the administrators */
  displayName?: string;

  /** E-Mail addesses */
  emails?: {
    value?: string;
  }[];

  /** Groups assigned to the user */
  groups?: {
    value?: string;
    display?: string;
  }[];

  /** Photos for the user usually provided by URL in value */
  photos?: {
    value?: string;
    type?: string;
  }[];
}

/**
 * Default transform-function provided to the {@link validateAuthSessionId}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category Authentication
 */
export function _validateAuthSessionIdDefaultTransformFunction(response: HttpResponse, _: DvelopContext): DvelopUser {
  return response.data;
}

/**
 * Factory for the {@link validateAuthSessionId}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @typeparam T Return type of the {@link validateAuthSessionId}-function. A corresponding transformFunction has to be supplied.
 * @category Authentication
 */
export function _validateAuthSessionIdFactory<T>(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: DvelopContext) => T,
): (context: DvelopContext) => Promise<T> {
  return async (context: DvelopContext) => {
    const response: HttpResponse = await httpRequestFunction(context, {
      method: "GET",
      url: "/identityprovider",
      follows: ["validate"]
    });
    return transformFunction(response, context);
  };
}

/**
 * Validates an AuthSessionId and returns a {@link DvelopUser}.
 *
 * ```typescript
 * import { validateAuthSessionId } from "@dvelop-sdk/identityprovider";
 *
 * const user: DvelopUser = await validateAuthSessionId({
 *   systemBaseUri: "https://monster-ag.d-velop.cloud",
 *   authSessionId: "dQw4w9WgXcQ"
 * });
 *
 * console.log(user.displayName) //Mike Glotzkowski
 * ```
 * @category Authentication
 */
/* istanbul ignore next */
export async function validateAuthSessionId(context: DvelopContext): Promise<DvelopUser> {
  return await _validateAuthSessionIdFactory(_defaultHttpRequestFunction, _validateAuthSessionIdDefaultTransformFunction)(context);
}
