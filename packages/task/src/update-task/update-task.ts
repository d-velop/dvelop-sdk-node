import axios from "axios";
import { Task } from "../task";

/**
 * Update an existing [Task]{@link Task}.
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

  if (!task.location) {
    throw new Error("Failed to update Task.\nNo Location");
  }

  try {
    await axios.patch(`${systemBaseUri}${task.location}`, task, {
      headers: {
        "Authorization": `Bearer ${authSessionId}`,
        "Origin": systemBaseUri
      },
    });
  } catch (e) {
    if (e.response) {
      switch (e.response.status) {
      case 401:
        throw new Error("The user is not authenticated.");
      case 403:
        throw new Error("The user does not have the permission to update this task.");
      case 404:
        throw new Error("The task does not exist.");
      case 410:
        throw new Error("This task was already completed.");
      }
    }
    throw new Error(`Failed to update Task: ${JSON.stringify(e)}`);
  }
}