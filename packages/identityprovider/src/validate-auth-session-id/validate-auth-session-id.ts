import axios, { AxiosResponse } from "axios";
import { followHalJson } from "@dvelop-sdk/axios-hal-json";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "../errors";
import { ScimUser } from "./scim-user";
axios.interceptors.request.use(followHalJson);

/**
 * Validates an AuthSessionId and returns a [ScimUser]{@link ScimUser}
 *
 * @throws [[UnauthorizedError]] indicates that an invalid or no authSessionId was sent.
 * @throws [[ForbiddenError]] indicates that a valid authSessionId for an external user was sent but external validation was set to false.
 * @throws [[NotFoundError]] indicates that a valid token for a deleted user was sent.
 *
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

  const errorContext: string = "Failed to validate authSessionId";

  try {
    const response: AxiosResponse<ScimUser> = await axios.get<ScimUser>("/identityprovider", {
      baseURL: systemBaseUri,
      headers: {
        "Authorization": `Bearer ${authSessionId}`
      },
      follows: ["validate"]
    });
    return response.data;
  } catch (e) {
    if (e.response) {
      switch (e.response.status) {
      case 401:
        throw new UnauthorizedError(errorContext, e.response);
      case 403:
        throw new ForbiddenError(errorContext, e.response);
      case 404:
        throw new NotFoundError(errorContext, e.response);
      }
    }
    e.message = `${errorContext}: ${e.message}`;
    throw e;
  }
}