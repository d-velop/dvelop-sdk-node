import { DvelopContext } from "@dvelop-sdk/core";
import {HttpConfig, HttpResponse, _defaultHttpRequestFunction, TaskError} from "../../utils/http";

/**
 * Parameters for the {@link completeTask}-function.
 * @category Task
 */
export interface CompleteTaskParams {
  /** Location-URI of the task. */
  location: string;
}

/**
 * Factory for the {@link completeTask}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @typeparam T Return type of the {@link completeTask}-function. A corresponding transformFunction has to be supplied.
 * @internal
 * @category Task
 */
export function _completeTaskFactory<T>(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: DvelopContext, params: CompleteTaskParams) => T,
): (context: DvelopContext, params: CompleteTaskParams) => Promise<T> {
  return async (context: DvelopContext, params: CompleteTaskParams) => {
    const matches: RegExpExecArray | null = /^\/task\/tasks\/(?<id>[^?]*)\??.*$/i.exec(params.location);
    if (matches) {
      const id = matches.groups?.id;

      const response: HttpResponse = await httpRequestFunction(context, {
        method: "POST",
        url: `/task/tasks/${id}/completionState`,
        data: {
          complete: true
        }
      });
      return transformFunction(response, context, params);
    } else {
      throw new TaskError(`Failed to parse task id from '${params.location}'`);
    }
  };
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
/* istanbul ignore next */
export function completeTask(context: DvelopContext, params: CompleteTaskParams): Promise<void> {
  return _completeTaskFactory(_defaultHttpRequestFunction, () => { })(context, params);
}