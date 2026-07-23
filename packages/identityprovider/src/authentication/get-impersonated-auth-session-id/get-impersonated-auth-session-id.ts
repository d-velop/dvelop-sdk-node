import { DvelopContext, DvelopOptions, dvelopFetch } from "@dvelop-sdk/core";
import { ensureSuccessResponse } from "../../utils/identityprovider-error";

/**
 * Parameters for the {@link getImpersonatedAuthSessionId}-function.
 * @category Authentication
 */
export interface GetImpersonatedAuthSessionIdParams {
  userId: string;
}

/**
 * Default `onResponse` provided to the {@link getImpersonatedAuthSessionId}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category Authentication
 */
export async function onResponse(response: Response): Promise<string> {
  await ensureSuccessResponse(response);
  const data: any = await response.json();
  return data.authSessionId;
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
export async function getImpersonatedAuthSessionId(context: DvelopContext, params: GetImpersonatedAuthSessionIdParams): Promise<string>;
export async function getImpersonatedAuthSessionId<T>(context: DvelopContext, params: GetImpersonatedAuthSessionIdParams, options: DvelopOptions<T>): Promise<T>;
export async function getImpersonatedAuthSessionId<T>(
  context: DvelopContext,
  params: GetImpersonatedAuthSessionIdParams,
  options: DvelopOptions<T | string> = {
    onResponse: onResponse
  }
): Promise<T | string> {
  return dvelopFetch(context, `/identityprovider/impersonatesession?userId=${encodeURIComponent(params.userId)}`, { method: "GET" }, options);
}
