import { DvelopContext } from "@dvelop-sdk/core";
import { HttpConfig, HttpResponse, _defaultHttpRequestFunction } from "../../utils/http";

/**
 * Parameters for the {@link getTask}-function.
 * @category Task
 */
export interface GetTaskParams {
  /** ID of the task */
  taskId: string;
}

/**
 * Response for the {@link getTask}-function.
 * @category Task
 */
export interface Task {
  /** Unique id of the task */
  id: string;
  /** The subject of the task */
  subject: string;
  /** The recipients of the task. You can specify individual users as well as groups using IDs of the Identityprovider-App */
  assignees: string[];
  /** Sender of the task */
  sender: string;
  /** The correlation key ensures that only one task is created for this unique key. If a task already exists with the passed key, a new task will not be created. */
  correlationKey?: string;
  /** A descriptive text of the task */
  description?: string;
  /** State of the task */
  state: "OPEN" | "COMPLETED";
  /** Priority between 0 (low) and 100 (high) */
  priority?: number,
  /** Receive date */
  receiveDate: Date;
  /** Reminder date. If you transfer a date without a timestamp, the reminder date is the transferred date at 00:00:00. */
  reminderDate?: Date;
  /** Due date of the task. If you transfer a date without a timestamp, the due date is the transferred date at 00:00:00. */
  dueDate?: Date;
  /**
   * Specify how long the task details should be kept after completing the task. Valid values are between 0 and 365 days. After this time has passed, the task details will be deleted automatically.
   * The information is specified as a time span in days according to ISO-8601, e.g. P30D for 30 days.  Specify the time span P0D if the task details should be deleted immediately after the task is completed. If you make no specification, 30 days are automatically assumed.
   */
  retentionTime?: string;
  /** ID of the user that completed this task. Only present if completed */
  completionUser?: string;
  /** Time at which the task was completed. Only present if completed */
  completionDate?: Date;
  /** The context of a task */
  context?: {
    /**  A technical identifier for the context */
    key?: string;
    /** Type of the context */
    type?: string;
    /** Display name of the context */
    name?: string;
  },

  /** Metadata for the task. See [the documentation](https://developer.d-velop.de/documentation/taskapi/en#creating-a-task) for further information */
  metadata?: {
    /** A technical identifier for the metadata-field */
    key: string;
    /** Label of the metadata-field */
    caption?: string;
    /** Type of the metadata-field */
    type: "String" | "Number" | "Money" | "Date";
    /** Value of the metadata field. Currently, only one value is allowed per metadata-field. */
    values?: string;
  }[];
  /** DmsObject that references the task. */
  dmsReferences?: {
    /** ID of the repository */
    repoId: string;
    /** ID of the DmsObject */
    objectId: string;
  }[];

  /** Links to the task */
  _links?: {
    /** Link to this task. */
    self: { href: string; };
    /** This URI provides an editing dialog for the task. You can find further details in the section [Adding editing dialogs](https://developer.d-velop.de/documentation/taskapi/en#adding-editing-dialogs). */
    form?: { href: string; };
    /** This URI is displayed as an action in the user interface to display additional information for the user. */
    attachment?: { href: string; };
  }
}

/**
 * Default transform-function provided to the {@link getTask}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category Task
 */
export function _getTaskDefaultTransformFunction(response: HttpResponse, _: DvelopContext, __: GetTaskParams): Task {
  let task : Task;
  const responseTask = response.data;
  task = {...responseTask};

  if (responseTask.receiveDate) {
    task.receiveDate = new Date(responseTask.receiveDate);
  }
  if (responseTask.reminderDate) {
    task.reminderDate = new Date(responseTask.reminderDate);
  }
  if (responseTask.dueDate) {
    task.dueDate = new Date(responseTask.dueDate);
  }
  if (responseTask.completionDate) {
    task.completionDate = new Date(responseTask.completionDate);
  }

  return task;
}

/**
 * Factory for the {@link getTask}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @typeparam T Return type of the {@link getTask}-function. A corresponding transformFunction has to be supplied.
 * @internal
 * @category Task
 */
export function _getTaskFactory<T>(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: DvelopContext, params: GetTaskParams) => T
): (context: DvelopContext, params: GetTaskParams) => Promise<T> {

  return async (context: DvelopContext, params: GetTaskParams) => {
    const response: HttpResponse = await httpRequestFunction(context, {
      method: "GET",
      url: `/task/tasks/${params.taskId}`
    });

    return transformFunction(response, context, params);
  };
}

/**
 * Get a task.
 * @returns A task object
 *
 * ```typescript
 * import { getTask } from "@dvelop-sdk/task";
 *
 * const task = await getTask({
 *   systemBaseUri: "https://umbrella-corp.d-velop.cloud",
 *   authSessionId: "dQw4w9WgXcQ"
 * }, {
 *   id: "SomeTaskId"
 * });
 * ```
 *
 * @category Task
 */
/* istanbul ignore next */
export function getTask(context: DvelopContext, params: GetTaskParams): Promise<Task> {
  return _getTaskFactory(_defaultHttpRequestFunction, _getTaskDefaultTransformFunction)(context, params);
}