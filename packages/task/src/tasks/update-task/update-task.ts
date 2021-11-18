import { DvelopContext } from "@dvelop-sdk/core";
import { HttpConfig, HttpResponse, _defaultHttpRequestFunction } from "../../utils/http";

export interface UpdateTaskParams {
  location: string;
  subject?: string;
  assignees?: string[];
  correlationKey?: string;
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
  _links?: {
    form?: { href: string; };
    callback?: { href: string; };
    attachment?: { href: string; };
    process?: { href: string; };
    changeCallback?: { href: string; };
  }
}

/**
 * Factory for the {@link updateTask}-function. See internals for more information.
 * @typeparam T Return type of the {@link updateTask}-function. A corresponding transformFuntion has to be supplied.
 * @internal
 * @category Task
 */
export function _updateTaskFactory<T>(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: DvelopContext, params: UpdateTaskParams) => T,
): (context: DvelopContext, params: UpdateTaskParams) => Promise<T> {

  return async (context: DvelopContext, params: UpdateTaskParams) => {

    const task: any = { ...params, ...{ location: null } };

    if (params.dueDate) {
      task.dueDate = params.dueDate.toISOString();
    }

    if (params.reminderDate) {
      task.reminderDate = params.reminderDate.toISOString();
    }

    const response: HttpResponse = await httpRequestFunction(context, {
      method: "PATCH",
      url: params.location,
      data: task
    });
    return transformFunction(response, context, params);
  };
}

/**
 * Update a task.
 *
 * ```typescript
 * import { updateTask } from "@dvelop-sdk/task";
 *
 * await updateTask({
 *   systemBaseUri: "https://umbrella-corp.d-velop.cloud",
 *   authSessionId: "dQw4w9WgXcQ"
 * }, {
 *   location: "some/task/location",
 *   description: "Try harder! Bribe some people if you must.",
 *   dueDate: new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 5)) // due in 5 days
 * });
 * ```
 *
 * @category Task
 */
/* istanbul ignore next */
export function updateTask(context: DvelopContext, params: UpdateTaskParams): Promise<void> {
  return _updateTaskFactory(_defaultHttpRequestFunction, () => { })(context, params);
}