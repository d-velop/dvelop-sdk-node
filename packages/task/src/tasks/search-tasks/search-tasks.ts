import { DvelopContext, DvelopOptions, dvelopFetch } from "@dvelop-sdk/core";
import { ensureSuccessResponse } from "../../utils/task-error";
import {Task} from "../get-task/get-task";

/**
 * Parameters for the {@link searchTasks}-function.
 * @category Task
 */
export interface SearchTasksParams {
  /**
   * Number of tasks per page in the results. Maximum 100.
   */
  pageSize?: number;
  /**
   * Value used to sort the results. Permitted values: received, subject, priority and dueDate.
   */
  orderBy?: "received" | "subject" | "priority" | "dueDate" | string;
  /**
   * Specified sort order. Permitted values: ASC for sorting in ascending order and DESC for sorting in descending order.
   */
  orderDir?: "ASC" | "DESC";
  /**
   * Optional search criteria.
   */
  filter?: {
    /**
     * Search for subject. Minimum 1 character, maximum 255.
     */
    subject?: string[];
    /**
     * Search for recipient. Minimum 1 character, maximum 255.
     */
    assignee?: string[];
    /**
     * Search for sender. Minimum 1 character, maximum 255.
     */
    sender?: string[];
    /**
     * Search for state. Permitted values: OPEN and COMPLETED.
     */
    state?: ("OPEN" | "COMPLETED")[],
    /**
     * Search for context key. 	Max. 255 characters.
     */
    contextKey?: string[];
    /**
     * 	Search for context name. 	Max. 255 characters.
     */
    contextName?: string[];
    /**
     * 	Search for context type. 	Max. 255 characters.
     */
    contextType?: string[];
    /**
     * Search for DMS repository ID. Minimum 1 character, maximum 100.
     */
    dmsRepoId?: string[];
    /**
     * 	Search for DMS object ID. 	Minimum 1 character, maximum 100.
     */
    dmsObjectId?: string[];
    /**
     * 	Search for attachment. 	Minimum 1 character, maximum 1.000.
     */
    attachment?: string[];
    /**
     * Search for user who completed the task. Minimum 1 character, maximum 255.
     */
    completionUser?: string[];
    /**
     * Search for priority. 	Between 0 and 100. You can search for individual priorities (.e.g.: [50]) or priority ranges (e.g. [“[5 to 50]”]).
     */
    priority?: (number | string)[];
    /**
     * 	Search for date received. Date format according to RFC3339. You can only search for a range.
     */
    received?: string[];
    /**
     * Search for due date. 	Date format according to RFC3339. You can only search for a range.
     */
    dueDate?: string[];
    /**
     * Search for reminder date. 	Date format according to RFC3339. You can only search for a range.
     */
    reminderDate?: string[];
    /**
     * Search for completion date. Date format according to RFC3339. You can only search for a range.
     */
    completionDate?: string[];
    /**
     * Search for metadata. 	Can contain any quantity of metadata.
     * You can only use metadata of the type “STRING” for the search.
     */
    metadata?: {
      /**
       * Search entry for an individual piece of metadata. Minimum 1 character, maximum 255. The key contains a minimum of 1 character, maximum 255.
       */
      [key: string]: string[]
    }
  };
}

/**
 * Parameters for the {@link buildRangeParameter} function
 * At least one of 'from' or 'to' is required.
 */
export interface BuildRangeParameterParams<T> {
  from?: T;
  to?: T;
  beginInclusive?: boolean;
  endInclusive?: boolean;
}

/**
 * Helper function to build search ranges for priority or date values.
 * @param params Description of the range.
 *
 * ```typescript
 * import { buildRangeParameter } from "@dvelop-sdk/task";
 *
 * const range = buildRangeParameter({
 *   from: new Date(),
 *   to: new Date("2025-01-01T00:00:00.000Z"),
 *   beginInclusive: true,
 *   endInclusive: true
 * });
 * ```
 */
export function buildRangeParameter(params: BuildRangeParameterParams<number | Date>) : string {
  let result = "";

  if (params.from === undefined && params.to === undefined) {
    throw new Error("A range must define at least on value from 'from' or 'to'");
  }

  if (params.beginInclusive ?? true) {
    result += "[";
  } else {
    result += "(";
  }

  if (params.from !== undefined) {
    if (params.from instanceof Date) {
      result += params.from.toISOString();
    } else {
      result += params.from;
    }
  }

  result += "..";

  if (params.to !== undefined) {
    if (params.to instanceof Date) {
      result += params.to.toISOString();
    } else {
      result += params.to;
    }
  }

  if (params.endInclusive ?? true) {
    result += "]";
  } else {
    result += ")";
  }

  return result;
}

/**
 * A result page returned by the {@link searchTasks} function.
 */
export interface SearchTasksPage {
  /** Tasks that match the search parameters */
  tasks: Task[],
  /** Gets the next page for this search. Undefined if there is none */
  getNextPage? : () => Promise<SearchTasksPage>
}

/**
 * Factory for the default `onResponse` provided to the {@link searchTasks}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category Task
 */
export function onResponseFactory(
  context: DvelopContext,
  params: SearchTasksParams
): (response: Response) => Promise<SearchTasksPage> {
  return async (response: Response) => {

    await ensureSuccessResponse(response);
    const data: any = await response.json();

    const page: SearchTasksPage = {
      tasks: data.tasks
    };

    page.tasks.forEach(task => {
      if (task.receiveDate) {
        task.receiveDate = new Date(task.receiveDate);
      }
      if (task.reminderDate) {
        task.reminderDate = new Date(task.reminderDate);
      }
      if (task.dueDate) {
        task.dueDate = new Date(task.dueDate);
      }
      if (task.completionDate) {
        task.completionDate = new Date(task.completionDate);
      }
    });

    if (data._links?.next) {
      page.getNextPage = async () => dvelopFetch(context, data._links.next.href, {
        method: "POST",
        body: JSON.stringify(params)
      }, {
        onResponse: onResponseFactory(context, params)
      });
    }

    return page;
  };
}

/**
 * Search for tasks.
 * @returns A page of matching tasks.
 *
 * ```typescript
 * import { searchTasks } from "@dvelop-sdk/task";
 *
 * const task = await searchTasks({
 *   systemBaseUri: "https://umbrella-corp.d-velop.cloud",
 *   authSessionId: "dQw4w9WgXcQ"
 * }, {
 *   pageSize: 10,
 *   filter: {
 *     subject: ["My subject"]
 *   }
 * });
 * ```
 *
 * @category Task
 */
export async function searchTasks(context: DvelopContext, params: SearchTasksParams): Promise<SearchTasksPage>;
export async function searchTasks<T>(context: DvelopContext, params: SearchTasksParams, options: DvelopOptions<T>): Promise<T>;
export async function searchTasks<T>(
  context: DvelopContext,
  params: SearchTasksParams,
  options: DvelopOptions<T | SearchTasksPage> = {
    onResponse: onResponseFactory(context, params)
  }
): Promise<T | SearchTasksPage> {
  return dvelopFetch(context, "/task/api/tasks/search", {
    method: "POST",
    body: JSON.stringify(params)
  }, options);
}