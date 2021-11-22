import { DvelopContext } from "@dvelop-sdk/core";
import { HttpConfig, HttpResponse, _defaultHttpRequestFunction } from "../../utils/http";

/**
 * Parameters for the {@link deleteTask}-function.
 * @category Task
 */
export interface DeleteTaskParams {
  /** Location-URI of the task. */
  location: string;
}

/**
 * Factory for the {@link deleteTask}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @typeparam T Return type of the {@link deleteTask}-function. A corresponding transformFuntion has to be supplied.
 * @internal
 * @category Task
 */
export function _deleteTaskFactory<T>(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: DvelopContext, params: DeleteTaskParams) => T,
): (context: DvelopContext, params: DeleteTaskParams) => Promise<T> {
  return async (context: DvelopContext, params: DeleteTaskParams) => {

    const response: HttpResponse = await httpRequestFunction(context, {
      method: "DELETE",
      url: params.location
    });
    return transformFunction(response, context, params);
  };
}

/**
 * Mark task as completed.
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
/* istanbul ignore next */
export function deleteTask(context: DvelopContext, params: DeleteTaskParams): Promise<void> {
  return _deleteTaskFactory(_defaultHttpRequestFunction, () => { })(context, params);
}