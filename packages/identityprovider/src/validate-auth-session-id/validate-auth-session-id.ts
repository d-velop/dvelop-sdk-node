import axios, { AxiosResponse } from "axios";
import { ScimUser } from "./scrim-user";

/**
 * Validates an AuthSessionId and returns a [ScimUser]{@link ScimUser}
 * @param {string} systemBaseUri SystemBaseUri for the tenant.
 * @param {string} authSessionId AuthSessionId which should be validated.
 * @returns {ScimUser}
 *
 * @example ```typescript
 * const user: ScimUser = await validateAuthSessionId("https://monster-ag.d-velop.cloud", "vXo4FMlnYYiGArNfjfJHEJDNWfjfejglgnewjgrjokgajifahfhdahfuewfhlR/4FxJxmNsjlq2XgWQm/GYVBq/hEvsJy1BK4WLoCXek=&ga8gds7gafkajgkj24ut8ugudash34jGlDG&dr6j0zusHVN8PcyerI0YXqRu30f8AGoUaZ6vInCDtZInS6aK2PplAelsv9t8");
 * console.log(user.displayName) //Mike Glotzkowski
 * ```
 */
export async function validateAuthSessionId(systemBaseUri: string, authSessionId: string): Promise<ScimUser> {
  const response: AxiosResponse<ScimUser> = await axios.get<ScimUser>(`${systemBaseUri}/identityprovider/validate`, {
    headers: {
      "Authorization": `Bearer ${authSessionId}`
    }
  }).catch(e => {
    throw new Error(`Failed to validate AuthSessionId.\n${e}`);
  });
  return response.data;
}