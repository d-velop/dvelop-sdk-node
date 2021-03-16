import axios, { AxiosResponse } from "axios";
import { ScimUser } from "./scrim-user";

/**
 * Validates an authSessionId and returns a [ScimUser]{@link ScimUser}
 * @param {string} systemBaseUri SystemBaseUri for the tenant.
 * @param {string} authsessionId AuthsessionId which needs validation.
 * @returns {ScimUser}
 *
 * @example ```typescript
 * const user: ScimUser = await validateAuthsessionId("https://monster-ag.d-velop.cloud", "vXo4FMlnYYiGArNfjfJHEJDNWfjfejglgnewjgrjokgajifahfhdahfuewfhlR/4FxJxmNsjlq2XgWQm/GYVBq/hEvsJy1BK4WLoCXek=&ga8gds7gafkajgkj24ut8ugudash34jGlDG&dr6j0zusHVN8PcyerI0YXqRu30f8AGoUaZ6vInCDtZInS6aK2PplAelsv9t8");
 * console.log(user.displayName) //Mike Glotzkowski
 * ```
 */
export async function validateAuthsessionId(systemBaseUri: string, authsessionId: string): Promise<ScimUser> {
  const response: AxiosResponse = await axios.get(`${systemBaseUri}/identityprovider/validate`, {
    headers: {
      "Authorization": `Bearer ${authsessionId}`
    }
  });
  return response.data as ScimUser;
}