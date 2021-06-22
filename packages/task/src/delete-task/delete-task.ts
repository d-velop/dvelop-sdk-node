import axios from "axios";
import { NoTaskLocationError, TaskAlreadyCompletedError, TaskNotFoundError, UnauthenticatedError, UnauthorizedError } from "../errors";
import { Task } from "../task";

/**
 * Delete a {@link Task}.
 *
 * @param {string} systemBaseUri SystemBaseUri for the tenant
 * @param {string} authSessionId Vaild AuthSessionId
 * @param {string|Task} task Location of the task or the {@link Task}
 *
 * @throws {@link NoTaskLocationError} indicates that no location was given.
 * @throws {@link UnauthenticatedError} indicates that the authSessionId was invalid or expired.
 * @throws {@link UnauthorizedError} indicates that the user associated with the authSessionId does miss permissions.
 * @throws {@link TaskNotFoundError} indicates that for the given location no task was found.
 * @throws {@link TaskAlreadyCompletedError} indicates that a task is already marked as completed.
 *
 * @example ```typescript
 *
 * await deleteTask("https://umbrella-corp.d-velop.cloud", "AUTH_SESSION_ID", "/some/task/location");
 *
 * // or
 *
 * const task: Task = {
 *     location: "/some/task/location",
 *   ...
 * }
 * await deleteTask("https://umbrella-corp.d-velop.cloud", "AUTH_SESSION_ID", task);
 * ```
 */

export async function deleteTask(systemBaseUri: string, authSessionId: string, task: string | Task): Promise<void> {

  const errorContext: string = "Failed to delete task";
  let location: string;

  if (task && typeof task === "string") {
    location = task;
  } else if (task && (task as Task).location) {
    location = (task as Task).location!;
  } else {
    throw new NoTaskLocationError(errorContext, task);
  }

  try {
    await axios.delete(location, {
      baseURL: systemBaseUri,
      headers: {
        "Authorization": `Bearer ${authSessionId}`,
        "Origin": systemBaseUri
      },
    });
  } catch (e) {
    if (e.response) {
      switch (e.response.status) {
      case 401:
        throw new UnauthenticatedError(errorContext, e.response);
      case 403:
        throw new UnauthorizedError(errorContext, e.response);
      case 404:
        throw new TaskNotFoundError(errorContext, location, e.response);
      case 410:
        throw new TaskAlreadyCompletedError(errorContext, location, e.response);
      }
    }
    e.message = `${errorContext}: ${e.message}`;
    throw e;
  }
}