import axios from "axios";
import { NoTaskLocationError, TaskNotFoundError, UnauthenticatedError, UnauthorizedError } from "../errors";
import { Task } from "../task";

/**
 * Delete a [Task]{@link Task}.
 *
 *
 * @throws [[NoTaskLocationError]] indicates that no location was given.
 * @throws [[UnauthenticatedError]] indicates that the authSessionId was invalid or expired.
 * @throws [[UnauthorizedError]] indicates that the user associated with the authSessionId does miss permissions.
 * @throws [[TaskNotFoundError]] indicates that for the given location no task was found.
 *
 * @param {string} systemBaseUri SystemBaseUri for the tenant
 * @param {string} authSessionId Vaild AuthSessionId
 * @param {string|Task} task Location of a task or the [Task]{@link Task} itself
 *
 * @example ```typescript
 * const taskLocation: string = "/some/task/location";
 * await deleteTask("https://umbrella-corp.d-velop.cloud", "AUTH_SESSION_ID", taskLocation);
 *
 * // or
 *
 * const task: Task = {
 *   location: "/some/task/location",
 *   ...
 * }
 * await deleteTask("https://umbrella-corp.d-velop.cloud", "AUTH_SESSION_ID", task);
 *
 * ```
 */

export async function deleteTask(systemBaseUri: string, authSessionId: string, task: string | Task): Promise<void> {

  const context: string = "Failed to delete task";
  let location: string;

  if (task && typeof task === "string") {
    location = task;
  } else if (task && (task as Task).location) {
    location = (task as Task).location!;
  } else {
    throw new NoTaskLocationError(context, task);
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
        throw new UnauthenticatedError(context, e.response);
      case 403:
        throw new UnauthorizedError(context, e.response);
      case 404:
        throw new TaskNotFoundError(context, location, e.response);
      }
    }
    e.message = `${context}: ${e.message}`;
    throw e;
  }
}