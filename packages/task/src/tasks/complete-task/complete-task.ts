import { DvelopContext, DvelopOptions, dvelopFetch } from "@dvelop-sdk/core";
import { ensureSuccessResponse, TaskError } from "../../utils/task-error";

/**
 * Parameters for the {@link completeTask}-function.
 * @category Task
 */
export interface CompleteTaskParams {
  /** Location-URI of the task. */
  location: string;
}

/**
 * Default `onResponse` provided to the {@link completeTask}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category Task
 */
export async function onResponse(response: Response): Promise<void> {
  await ensureSuccessResponse(response);
}

/**
 * Complete a task.
 *
 * ```typescript
 * import { completeTask } from "@dvelop-sdk/task";
 *
 * await completeTask({
 *   systemBaseUri: "https://umbrella-corp.d-velop.cloud",
 *   authSessionId: "dQw4w9WgXcQ"
 * }, {
 *   location: "some/task/location"
 * });
 * ```
 *
 * @category Task
 */
export async function completeTask(context: DvelopContext, params: CompleteTaskParams): Promise<void>;
export async function completeTask<T>(context: DvelopContext, params: CompleteTaskParams, options: DvelopOptions<T>): Promise<T>;
export async function completeTask<T>(
  context: DvelopContext,
  params: CompleteTaskParams,
  options: DvelopOptions<T | void> = {
    onResponse: onResponse
  }
): Promise<T | void> {

  const matches: RegExpExecArray | null = /^\/task\/tasks\/([^?]*)\??.*$/i.exec(params.location);
  if (!matches) {
    throw new TaskError(`Failed to parse task id from '${params.location}'`);
  }
  const id = matches[1];

  return dvelopFetch(context, `/task/tasks/${id}/completionState`, {
    method: "POST",
    body: JSON.stringify({ complete: true })
  }, options);
}
