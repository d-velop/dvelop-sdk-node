import axios from "axios";
import { InvalidTaskError, NoTaskLocationError, TaskAlreadyCompletedError, TaskNotFoundError, UnauthenticatedError, UnauthorizedError } from "../errors";
import { Task } from "../task";

/**
 * Update an existing {@link Task}.
 *
 * @param {string} systemBaseUri SystemBaseUri for the tenant
 * @param {string} authSessionId Vaild AuthSessionId
 * @param {Task} task {@link Task} with updated values
 * @returns {Task} Updated {@link Task}
 *
 * @throws {@link NoTaskLocationError} indicates that no location was given.
 * @throws {@link InvalidTaskError} indicates that the given task was not accepted because it is invalid. You can check the ```error.validation```-property.
 * @throws {@link UnauthenticatedError} indicates that the authSessionId was invalid or expired.
 * @throws {@link UnauthorizedError} indicates that the user associated with the authSessionId does miss permissions.
 * @throws {@link TaskNotFoundError} indicates that for the given location no task was found.
 * @throws {@link TaskAlreadyCompletedError} indicates that a task is already marked as completed.
 *
 * @example ```typescript
 *
 * const task: Task = {
 *   ...
 *   description: "Try harder! Bribe some people if you must."
 * }
 *
 * await updateTask("https://umbrella-corp.d-velop.cloud", "AUTH_SESSION_ID", task);
 * ```
 */

export async function updateTask(systemBaseUri: string, authSessionId: string, task: Task,): Promise<Task> {

  const errorContext: string = "Failed to update task";
  let location: string;

  if (task.location) {
    location = task.location;
  } else {
    throw new NoTaskLocationError(errorContext, task);
  }

  try {
    await axios.patch(location, task, {
      baseURL: systemBaseUri,
      headers: {
        "Authorization": `Bearer ${authSessionId}`,
        "Origin": systemBaseUri
      },
    });
    return task;
  } catch (e) {
    if (e.response) {
      switch (e.response.status) {
      case 400:
        throw new InvalidTaskError(errorContext, task, e.response.data, e.response);
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