import axios from "axios";
import { Task, TaskDto } from "../task";

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
  let updateTask = task as TaskDto;
  await axios.patch(`${systemBaseUri}${task.location}`, updateTask, {
    headers: {
      "Authorization": `Bearer ${authsessionId}`,
      "Origin" : systemBaseUri
    },
  });
}