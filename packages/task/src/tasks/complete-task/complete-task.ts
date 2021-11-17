import { DvelopContext } from "@dvelop-sdk/core";
import { HttpConfig, HttpResponse, _defaultHttpRequestFunction } from "../../utils/http";

export interface CompleteTaskParams {
  location: string;
}

/**
 * Factory for the {@link completeTask}-function. See internals for more information.
 * @typeparam T Return type of the {@link completeTask}-function. A corresponding transformFuntion has to be supplied.
 * @internal
 * @category Task
 */
export function _completeTaskFactory<T>(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: DvelopContext, params: CompleteTaskParams) => T,
): (context: DvelopContext, params: CompleteTaskParams) => Promise<T> {
  return async (context: DvelopContext, params: CompleteTaskParams) => {

    const response: HttpResponse = await httpRequestFunction(context, {
      method: "POST",
      url: params.location,
      follows: ["completion"],
      data: {
        complete: true
      }
    });
    return transformFunction(response, context, params);
  };
}

/**
 * Complete a task.
 *
 * ```typescript
 * ```
 *
 * @category Task
 */
/* istanbul ignore next */
export function completeTask(context: DvelopContext, params: CompleteTaskParams): Promise<void> {
  return _completeTaskFactory(_defaultHttpRequestFunction, () => { })(context, params);
}