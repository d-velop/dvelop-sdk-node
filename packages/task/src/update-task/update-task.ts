import axios from "axios";
import { InvalidTaskError, NoTaskLocationError, TaskAlreadyCompletedError, TaskNotFoundError, UnauthenticatedError, UnauthorizedError } from "../errors";
import { Task } from "../task";

/**
 * Update an existing [Task]{@link Task}.
 *
 * @throws [[NoTaskLocationError]] indicates that no location was given.
 * @throws [[InvalidTaskError]] indicates that the given task was not accepted because it is invalid. You can check the ```error.validation```-property.
 * @throws [[UnauthenticatedError]] indicates that the authSessionId was invalid or expired.
 * @throws [[UnauthorizedError]] indicates that the user associated with the authSessionId does miss permissions.
 * @throws [[TaskNotFoundError]] indicates that for the given location no task was found.
 * @throws [[TaskAlreadyCompleted]] indicates that a task is already marked as completed.
 *
 * @param {string} systemBaseUri SystemBaseUri for the tenant.
 * @param {string} authSessionId Vaild AuthSessionId
 * @param {Task} task Task object with values to be updated.
 *
 * @example ```typescript
 * task.description = "Try harder! Bribe some people if u must."
 * await updateTask("https://umbrella-corp.d-velop.cloud", "AUTH_SESSION_ID", task);
 * ```
 */

export async function updateTask(systemBaseUri: string, authSessionId: string, task: Task,): Promise<void> {

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