import axios, { AxiosResponse } from "axios";
import { Task } from "../task";
import { v4 } from "uuid";

/**
 * Creates a [Task]{@link Task} and returns it. This method will automatically generate a random correlation key if the task does not contain one.
 *
 * @param {string} systemBaseUri SystemBaseUri for the tenant
 * @param {string} authRessionId Vaild AuthSessionId
 * @param {Task} task Task to be created
 * @returns {Task} Created Task
 *
 * @example ```typescript
 * const task: Task = {
 *   subject: "Cover up lab accident",
 *   assignees: ["USER_ID_1", "USER_ID_2"],
 *   correlationKey: "everythingIsFine", // can be randomly generated
 * }
 * task = await createTask("https://umbrella-corp.d-velop.cloud", "AUTH_SESSION_ID ", task);
 * ```
 */
export async function createTask(systemBaseUri: string, authSessionId: string, task: Task): Promise<Task> {

  if (!task.correlationKey) {
    task.correlationKey = v4();
  }

  try {
    const response: AxiosResponse = await axios.post(`${systemBaseUri}/task/tasks`, task, {
      headers: {
        "Authorization": `Bearer ${authSessionId}`,
        "Origin": systemBaseUri
      },
    });

    const location: string = response.headers.location;
    let createdTask: Task = { ...task, location: location };
    return createdTask;

  } catch (e) {
    if (e.response) {
      switch (e.response.status) {
      case 400:
        throw new Error(`Task is invalid.\nValidation: ${JSON.stringify(e.response.data)}`);
      case 401:
        throw new Error("The user is not authenticated.");
      case 403:
        throw new Error("The user is not eligible to create the task.");
      }
    }
    throw new Error(`Failed to create Task: ${JSON.stringify(e)}`);
  }

}