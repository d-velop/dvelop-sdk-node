import axios, { AxiosResponse } from "axios";
import { NoTaskLocationError, TaskNoFoundError, UnauthenticatedUserError, UnauthorizedUserError } from "../errors";
import { Task } from "../task";

/**
 * Tried to complete a Task which was already completed.
 * @category Error
 */
export class TaskAlreadyCompletedError extends Error {
  // eslint-disable-next-line no-unused-vars
  constructor(context: string, public location: string, public response: AxiosResponse) {
    super(`${context}: Task was already completed at location: ${location}`);
    Object.setPrototypeOf(this, TaskAlreadyCompletedError.prototype);
  }
}

/**
 * Marks a [Task]{@link Task} as completed.
 *
 * @param {string} systemBaseUri SystemBaseUri for the tenant
 * @param {string} authSessionId Vaild AuthSessionId
 * @param {string|Task} task Location of a task or the [Task]{@link Task} itself
 *
 * @example ```typescript
 * const taskLocation: string = "/some/task/location";
 * await completeTask("https://umbrella-corp.d-velop.cloud", "AUTH_SESSION_ID", taskLocation);
 *
 * // or
 *
 * const task: Task = {
 *   location: "/some/task/location",
 *   ...
 * }
 * await completeTask("https://umbrella-corp.d-velop.cloud", "AUTH_SESSION_ID", task);
 * ```
 */

export async function completeTask(systemBaseUri: string, authSessionId: string, task: string | Task): Promise<void> {

  const context = "Failed to complete task";
  let location: string;

  if (task && typeof task === "string") {
    location = task;
  } else if (task && (task as Task).location) {
    location = (task as Task).location!;
  } else {
    throw new NoTaskLocationError(context, task);
  }

  try {
    await axios.post<void>(`${location}/completionState`, { complete: true }, {
      baseURL: systemBaseUri,
      headers: {
        "Authorization": `Bearer ${authSessionId}`,
        "Origin": systemBaseUri
      }
    });
  } catch (e) {
    if (e.response) {
      switch (e.response.status) {
      case 401:
        throw new UnauthenticatedUserError(context, e.response);
      case 403:
        throw new UnauthorizedUserError(context, e.response);
      case 404:
        throw new TaskNoFoundError(context, location, e.response);
      case 410:
        throw new TaskAlreadyCompletedError(context, location, e.response);
      }
    }
    e.message = `${context}: ${e.message}`;
    throw e;
  }
}