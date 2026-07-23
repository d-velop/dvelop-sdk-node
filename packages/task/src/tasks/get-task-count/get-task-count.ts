import { DvelopContext, DvelopOptions, dvelopFetch } from "@dvelop-sdk/core";
import { ensureSuccessResponse } from "../../utils/task-error";

/**
 * Default `onResponse` provided to the {@link getTaskCount}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category Task
 */
export async function onResponse(response: Response): Promise<number> {
  await ensureSuccessResponse(response);
  const data: any = await response.json();
  return data.count;
}

/**
 * Get the number of tasks for the current user.
 *
 * ```typescript
 * import { getTaskCount } from "@dvelop-sdk/task";
 *
 * await getTaskCount({
 *   systemBaseUri: "https://umbrella-corp.d-velop.cloud",
 *   authSessionId: "dQw4w9WgXcQ"
 * });
 * ```
 *
 * @category Task
 */
export async function getTaskCount(context: DvelopContext): Promise<number>;
export async function getTaskCount<T>(context: DvelopContext, options: DvelopOptions<T>): Promise<T>;
export async function getTaskCount<T>(
  context: DvelopContext,
  options: DvelopOptions<T | number> = {
    onResponse: onResponse
  }
): Promise<T | number> {
  return dvelopFetch(context, "/task/count/all", { method: "GET" }, options);
}
