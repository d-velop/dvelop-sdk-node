import axios from "axios";
import { Task } from "../task";

/**
 * Updates a [Task] with {@link Task} for given id[string]
 * @param {string} systemBaseUri SystemBaseUri for the tenant.
 * @param {string} authsessionId AuthsessionId the call is executed with.
 * @param {Task} task Task object with values to be updated.
 *
 * @example ```typescript
 * const myTask: Task = {
 *     location: "/it/is/a/location/1234567890",
 *     subject: "My new subject",
 *     description: "I wanted to add a description to my existing task",
 *   }
 * await updateTask("https://monster-ag.d-velop.cloud", "vXo4FMlnYYiGArNfjfJHEJDNWfjfejglgnewjgrjokgajifahfhdahfuewfhlR/4FxJxmNsjlq2XgWQm/GYVBq/hEvsJy1BK4WLoCXek=&ga8gds7gafkajgkj24ut8ugudash34jGlDG&dr6j0zusHVN8PcyerI0YXqRu30f8AGoUaZ6vInCDtZInS6aK2PplAelsv9t8", myTask);
 * ```
 */

export async function updateTask(systemBaseUri: string, authsessionId: string, task: Task,): Promise<void> {

  if (!task.location) {
    throw new Error("Failed to update Task.\nNo Location");
  }

  try {
    await axios.patch(`${systemBaseUri}${task.location}`, task, {
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