import { DvelopContext } from "@dvelop-sdk/core";
import { HttpConfig, HttpResponse, _defaultHttpRequestFunction } from "../../utils/http";

/**
 * Default transform-function provided to the {@link getTaskCount}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category Task
 */
export function _getTaskCountDefaultTransformFunction(response: HttpResponse, _: DvelopContext): number {
  return response.data.count;
}

/**
 * Factory for the {@link getTaskCount}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @typeparam T Return type of the {@link getTaskCount}-function. A corresponding transformFuntion has to be supplied.
 * @internal
 * @category Task
 */
export function _getTaskCountFactory<T>(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: DvelopContext) => T,
): (context: DvelopContext) => Promise<T> {
  return async (context: DvelopContext) => {

    const response: HttpResponse = await httpRequestFunction(context, {
      method: "GET",
      follows: ["count", "all"]
    });
    return transformFunction(response, context);
  };
}

/**
 * Create a task.
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
/* istanbul ignore next */
export function getTaskCount(context: DvelopContext): Promise<number> {
  return _getTaskCountFactory(_defaultHttpRequestFunction, _getTaskCountDefaultTransformFunction)(context);
}