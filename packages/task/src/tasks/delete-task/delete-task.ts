import { DvelopContext, DvelopOptions, dvelopFetch } from "@dvelop-sdk/core";
import { ensureSuccessResponse } from "../../utils/task-error";

/**
 * Parameters for the {@link deleteTask}-function.
 * @category Task
 */
export interface DeleteTaskParams {
  /** Location-URI of the task. */
  location: string;
}

/**
 * Default `onResponse` provided to the {@link deleteTask}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category Task
 */
export async function onResponse(response: Response): Promise<void> {
  await ensureSuccessResponse(response);
}

/**
 * Delete a task.
 *
 * ```typescript
 * import { deleteTask } from "@dvelop-sdk/task";
 *
 * await deleteTask({
 *   systemBaseUri: "https://umbrella-corp.d-velop.cloud",
 *   authSessionId: "dQw4w9WgXcQ"
 * }, {
 *   location: "some/task/location"
 * });
 * ```
 *
 * @category Task
 */
export async function deleteTask(context: DvelopContext, params: DeleteTaskParams): Promise<void>;
export async function deleteTask<T>(context: DvelopContext, params: DeleteTaskParams, options: DvelopOptions<T>): Promise<T>;
export async function deleteTask<T>(
  context: DvelopContext,
  params: DeleteTaskParams,
  options: DvelopOptions<T | void> = {
    onResponse: onResponse
  }
): Promise<T | void> {
  return dvelopFetch(context, params.location, { method: "DELETE" }, options);
}
