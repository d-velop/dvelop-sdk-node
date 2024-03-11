import { DvelopContext, generateRequestId } from "@dvelop-sdk/core";
import { HttpConfig, HttpResponse, _defaultHttpRequestFunction } from "../../utils/http";

/**
 * Parameters for the {@link createTask}-function.
 * @category Task
 */
export interface CreateTaskParams {
  /** The subject of the task */
  subject: string;
  /** The recipients of the task. You can specify individual users as well as groups using IDs of the Identityprovider-App */
  assignees: string[];
  /** The correlation key ensures that only one task is created for this unique key. If a task already exists with the passed key, a new task will not be created. */
  correlationKey?: string;
  /** A descriptive text of the task */
  description?: string;
  /** Priority between 0 (low) and 100 (high) */
  priority?: number,
  /** Reminder date. If you transfer a date without a timestamp, the reminder date is the transferred date at 00:00:00. */
  reminderDate?: Date;
  /** Due date of the task. If you transfer a date without a timestamp, the due date is the transferred date at 00:00:00. */
  dueDate?: Date;
  /**
   * Specify how long the task details should be kept after completing the task. Valid values are between 0 and 365 days. After this time has passed, the task details will be deleted automatically.
   * The information is specified as a time span in days according to ISO-8601, e.g. P30D for 30 days.  Specify the time span P0D if the task details should be deleted immediately after the task is completed. If you make no specification, 30 days are automatically assumed.
   */
  retentionTime?: string;
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
    key?: string;
    /** Label of the metadata-field */
    caption?: string;
    /** Type of the metadata-field */
    type?: "String" | "Number" | "Money" | "Date";
    /** Value of the metadata field. Currently, only one value is allowed per metadata-field. */
    values?: string;
  }[];
  /** DmsObject that references the task. */
  dmsObject?: {
    /** ID of the repository */
    repositoryId: string;
    /** ID of the DmsObject */
    dmsObjectId: string;
  };
  /** Specifies if a notification should be sent to the task creator when the task is created. Default is true. */
  sendCreationNotification?: boolean;
  /** Specifies if a notification should be sent to the task creator when the task is completed. Default is false. */
  sendCompletionNotification?: boolean;
  /** Specifies if a notification should be sent to the task creator when the due date is exceeded. This option is only available if a dueDate is specified. Default is false. */
  sendDueDateNotification?: boolean;
  /** Links to the task */
  _links?: {
    /** This URI provides an editing dialog for the task. You can find further details in the section [Adding editing dialogs](https://developer.d-velop.de/documentation/taskapi/en#adding-editing-dialogs). */
    form?: { href: string; };
    /** This URI is called on completion of a task via the method POST. */
    callback?: { href: string; };
    /** This URI is displayed as an action in the user interface to display additional information for the user. */
    attachment?: { href: string; };
    /** This URI represents the process by which the task was initiated. The process is displayed in the user interface as a separate perspective for the task. To display completed tasks, the resource has to implement a HEAD request, if the resource is behind the same base address. */
    process?: { href: string; };
    /** This URI is called in case of updates to the task via the method POST. */
    changeCallback?: { href: string; };
  }
}

/**
 * Default transform-function provided to the {@link createTask}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category Task
 */
export function _createTaskDefaultTransformFunction(response: HttpResponse, _: DvelopContext, __: CreateTaskParams): string {
  return response.headers["location"] || "";
}

/**
 * Factory for the {@link createTask}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @typeparam T Return type of the {@link createTask}-function. A corresponding transformFuntion has to be supplied.
 * @internal
 * @category Task
 */
export function _createTaskFactory<T>(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: DvelopContext, params: CreateTaskParams) => T,
  uuidGeneratorFunction?: () => string
): (context: DvelopContext, params: CreateTaskParams) => Promise<T> {

  return async (context: DvelopContext, params: CreateTaskParams) => {

    const task: any = { ...params };

    if (uuidGeneratorFunction && !params.correlationKey) {
      task.correlationKey = uuidGeneratorFunction();
    }

    if (params.dueDate) {
      task.dueDate = params.dueDate.toISOString();
    }

    if (params.reminderDate) {
      task.reminderDate = params.reminderDate.toISOString();
    }

    if (params.dmsObject) {
      task.dmsReferences = [{
        repoId: params.dmsObject.repositoryId,
        objectId: params.dmsObject.dmsObjectId
      }];
    }

    const response: HttpResponse = await httpRequestFunction(context, {
      method: "POST",
      url: "/task",
      follows: ["tasks"],
      data: task
    });

    return transformFunction(response, context, params);
  };
}

/**
 * Create a task.
 *
 * ```typescript
 * import { createTask } from "@dvelop-sdk/task";
 *
 * const taskLocation = await createTask({
 *   systemBaseUri: "https://umbrella-corp.d-velop.cloud",
 *   authSessionId: "dQw4w9WgXcQ"
 * }, {
 *   subject: "Cover up lab accident",
 *   assignees: ["XiFkyR35v2Y"]
 * });
 *
 * console.log(taskLocation); // some/task/location
 * ```
 *
 * @category Task
 */
/* istanbul ignore next */
export function createTask(context: DvelopContext, params: CreateTaskParams): Promise<string> {
  return _createTaskFactory(_defaultHttpRequestFunction, _createTaskDefaultTransformFunction, generateRequestId)(context, params);
}