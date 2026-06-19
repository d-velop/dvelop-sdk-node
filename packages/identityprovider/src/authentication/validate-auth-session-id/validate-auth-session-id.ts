import { DvelopContext, DvelopOptions, dvelopFetch } from "@dvelop-sdk/core";
import { ensureSuccessResponse } from "../../utils/identityprovider-error";

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
 * Default `onResponse` provided to the {@link validateAuthSessionId}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category Authentication
 */
export async function onResponse(response: Response): Promise<DvelopUser> {
  await ensureSuccessResponse(response);
  return await response.json();
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
export async function validateAuthSessionId(context: DvelopContext): Promise<DvelopUser>;
export async function validateAuthSessionId<T>(context: DvelopContext, options: DvelopOptions<T>): Promise<T>;
export async function validateAuthSessionId<T>(
  context: DvelopContext,
  options: DvelopOptions<T | DvelopUser> = {
    onResponse: onResponse
  }
): Promise<T | DvelopUser> {
  return dvelopFetch(context, "/identityprovider/validate", { method: "GET" }, options);
}
