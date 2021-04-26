import axios from "axios";
import { Task } from "../task";

/**
 * Delete Task for given Task id
 * @param {string} systemBaseUri SystemBaseUri for the tenant.
 * @param {string} authsessionId AuthsessionId the call is executed with.
 * @param {string|Task} task Location of a task or task or task object.
 *
 * @example ```typescript
 * const taskLocation = "/it/is/a/location/1234567890"
 * deleteTask("https://monster-ag.d-velop.cloud", "vXo4FMlnYYiGArNfjfJHEJDNWfjfejglgnewjgrjokgajifahfhdahfuewfhlR/4FxJxmNsjlq2XgWQm/GYVBq/hEvsJy1BK4WLoCXek=&ga8gds7gafkajgkj24ut8ugudash34jGlDG&dr6j0zusHVN8PcyerI0YXqRu30f8AGoUaZ6vInCDtZInS6aK2PplAelsv9t8", taskLocation);
 * ```
 */

export async function deleteTask(systemBaseUri: string, authsessionId: string, task: string | Task): Promise<void> {

  let location: string;

  if (task && typeof task === "string") {
    location = task;
  } else if (task && (task as Task).location) {
    location = (task as Task).location!;
  } else {
    throw new Error("Failed to delete Task.\nNo Location");
  }

  await axios.delete(`${systemBaseUri}${location}`, {
    headers: {
      "Authorization": `Bearer ${authsessionId}`,
      "Origin": systemBaseUri
    },
  });
}