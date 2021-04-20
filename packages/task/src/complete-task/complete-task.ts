import axios from "axios";
import { Task, instanceOfTask } from "../task";

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
  if(instanceOfTask(task)){
    location = task.location;
  } else {
    location = task;
  }

  await axios.post(`${systemBaseUri}${location}/completionState`, { "complete": true }, {
    headers: {
      "Authorization": `Bearer ${authsessionId}`,
      "Origin": systemBaseUri
    },
  });
}