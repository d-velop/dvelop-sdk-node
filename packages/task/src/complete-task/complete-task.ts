import axios from "axios";
import { Task } from "../task";

/**
 * Completes Task for given Task id
 * @param {string} systemBaseUri SystemBaseUri for the tenant.
 * @param {string} authsessionId AuthsessionId the call is executed with.
 * @param {string|Task} task Location of a task or task or task object.
 *
 * @example ```typescript
 * const taskId = "1234567890"
 * completeTask("https://monster-ag.d-velop.cloud", "vXo4FMlnYYiGArNfjfJHEJDNWfjfejglgnewjgrjokgajifahfhdahfuewfhlR/4FxJxmNsjlq2XgWQm/GYVBq/hEvsJy1BK4WLoCXek=&ga8gds7gafkajgkj24ut8ugudash34jGlDG&dr6j0zusHVN8PcyerI0YXqRu30f8AGoUaZ6vInCDtZInS6aK2PplAelsv9t8", taskId);
 * ```
 */

export async function completeTask(systemBaseUri: string, authsessionId: string, task: string | Task): Promise<void> {

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
        "Authorization": `Bearer ${authsessionId}`,
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