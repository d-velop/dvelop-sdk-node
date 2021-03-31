import axios, { AxiosResponse } from "axios";
import { Task } from "../task";
import { v4 } from "uuid";

/**
 * Creates a [Task] with {@link Task} and returns a task id[string]
 * @param {string} systemBaseUri SystemBaseUri for the tenant.
 * @param {string} authsessionId AuthsessionId the call is executed with.
 * @param {Task} task Task to be created.
 * @returns {Task} Created Task with location property.
 *
 * @example ```typescript
 * const myTask: Task = {
 *     subject: "Some nice subject for your task",
 *     assignees: ["FirstUserIdentityprovideId", "SecondUserIdentityproviderId", "someGroupIdentityproviderId"],
 *     correlationKey: "SomeUniqueKeyForYourTask",
 *   }
 * const taskId: string = await createTask("https://monster-ag.d-velop.cloud", "vXo4FMlnYYiGArNfjfJHEJDNWfjfejglgnewjgrjokgajifahfhdahfuewfhlR/4FxJxmNsjlq2XgWQm/GYVBq/hEvsJy1BK4WLoCXek=&ga8gds7gafkajgkj24ut8ugudash34jGlDG&dr6j0zusHVN8PcyerI0YXqRu30f8AGoUaZ6vInCDtZInS6aK2PplAelsv9t8", myTask);
 * console.log(taskId) //2ua8dae2sc8k0rnpm117969bbg
 * ```
 */

export async function createTask(systemBaseUri: string, authsessionId: string, task: Task): Promise<Task> {
  if(!task.correlationKey){
    task.correlationKey = v4();
  }
  const response: AxiosResponse = await axios.post(`${systemBaseUri}/task/tasks`, task, {
    headers: {
      "Authorization": `Bearer ${authsessionId}`,
      "Origin": systemBaseUri
    },
  });

  const location: string = response.headers.location;
  task.location = location;

  return task;
}