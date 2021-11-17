import { DvelopContext } from "@dvelop-sdk/core";
import { HttpConfig, HttpResponse, _defaultHttpRequestFunction } from "../../utils/http";

export interface GetTaskParams {
  location: string;
}

export interface Task {
  id: string;
  location: string;
  subject: string;
  assignees: string[];
  correlationKey: string;
  description?: string;
  priority?: number,
  reminderDate?: Date;
  dueDate?: Date;
  retentionTime?: string;
  context?: {
    key?: string;
    type?: string;
    name?: string;
  },
  metadata?: {
    key?: string;
    caption?: string;
    type?: "String" | "Number" | "Money" | "Date";
    values?: string;
  }[];
  dmsReferences?: {
    repoId?: string;
    objectId?: string;
  }[];
  sendCreationNotification?: boolean;
  sendCompletionNotification?: boolean;
  sendDueDateNotification?: boolean;
}

/**
 * Default transform-function provided to the {@link createTask}-function.
 * @internal
 * @category Task
 */
export function _getTaskDefaultTransformFunction(response: HttpResponse, _: DvelopContext, params: GetTaskParams): Task {
  return { ...response.data, ...{ location: params.location } };
}

/**
 * Factory for the {@link createTask}-function. See internals for more information.
 * @typeparam T Return type of the {@link createTask}-function. A corresponding transformFuntion has to be supplied.
 * @internal
 * @category Task
 */
export function _getTaskFactory<T>(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: DvelopContext, params: GetTaskParams) => T,
): (context: DvelopContext, params: GetTaskParams) => Promise<T> {
  return async (context: DvelopContext, params: GetTaskParams) => {

    const response: HttpResponse = await httpRequestFunction(context, {
      method: "GET",
      url: params.location
    });
    return transformFunction(response, context, params);
  };
}

/**
 * Create a task.
 *
 * ```typescript
 * ```
 *
 * @category Task
 */
/* istanbul ignore next */
export function getTask(context: DvelopContext, params: GetTaskParams): Promise<Task> {
  return _getTaskFactory(_defaultHttpRequestFunction, _getTaskDefaultTransformFunction)(context, params);
}