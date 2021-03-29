import axios, { AxiosResponse } from "axios";
import { Task } from "../task";

/**
 * Creates a [Task] with {@link Task} and returns a task id[string]
 * @param {string} systemBaseUri SystemBaseUri for the tenant.
 * @param {string} authsessionId AuthsessionId the call is executed with.
 * @param {Task} task Task to be created.
 * @returns {string} Id of the created task.
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

export async function createTask(
    systemBaseUri: string,
    authsessionId: string, 
    task: Task,
    ): Promise<string> {
    const response: AxiosResponse = await axios.post(`${systemBaseUri}/task/tasks`,
    task, {
      headers: {
        "Authorization": `Bearer ${authsessionId}`,
        "Origin" : systemBaseUri
      },
    });

    const location:string = response.headers.location;
    const id: string = getIdFromLocation(location);

    return id;
  }

export function getIdFromLocation(location: string): string{
  let id:string = "";
  if(location && (location.match(/\//g) || []).length == 3){
    id = location.split("/")[3];
  }
  return id;
}