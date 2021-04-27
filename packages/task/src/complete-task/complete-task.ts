import axios from "axios";
import { Task } from "../task";

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

  let location: string;

  if (task && typeof task === "string") {
    location = task;
  } else if (task && (task as Task).location) {
    location = (task as Task).location!;
  } else {
    throw new Error("Failed to complete Task.\nNo Location");
  }

  try {
    await axios.post(`${systemBaseUri}${location}/completionState`, { "complete": true }, {
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
        throw new Error("The user does not have the permission to complete this task.");
      case 404:
        throw new Error("The task does not exist.");
      case 410:
        throw new Error("This task was already completed.");
      }
    }
    throw new Error(`Failed to create Task: ${JSON.stringify(e)}`);
  }
}