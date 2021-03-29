import axios from "axios";

/**
 * Delete Task for given Task id
 * @param {string} systemBaseUri SystemBaseUri for the tenant.
 * @param {string} authsessionId AuthsessionId the call is executed with.
 * @param {string} id Id of the task to be deleted.
 *
 * @example ```typescript
 * const taskId = "1234567890"
 * deleteTask("https://monster-ag.d-velop.cloud", "vXo4FMlnYYiGArNfjfJHEJDNWfjfejglgnewjgrjokgajifahfhdahfuewfhlR/4FxJxmNsjlq2XgWQm/GYVBq/hEvsJy1BK4WLoCXek=&ga8gds7gafkajgkj24ut8ugudash34jGlDG&dr6j0zusHVN8PcyerI0YXqRu30f8AGoUaZ6vInCDtZInS6aK2PplAelsv9t8", taskId);
 * ```
 */

 export async function deleteTask(
    systemBaseUri: string,
    authsessionId: string, 
    id: string,
    ): Promise<void> {
    await axios.delete(`${systemBaseUri}/task/tasks/${id}`,
     {
      headers: {
        "Authorization": `Bearer ${authsessionId}`,
        "Origin" : systemBaseUri
      },
    });
  }