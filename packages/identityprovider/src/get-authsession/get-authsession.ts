import axios, { AxiosResponse } from "axios";
import { Authsession } from "./authsession";

export interface AuthsessionDto {
  AuthSessionId: string;
  Expire: string;
}

/**
 * Returns an authSessionId based on an API-Key.
 * @param {string} systemBaseUri SystemBaseUri for the tenant.
 * @param {string} apiKey API-Key provided by the d.velop cloud.
 * @returns {string}
 *
 * @example ```typescript
 * ```
 */
export async function getAuthsession(systemBaseUri: string, apiKey: string): Promise<Authsession> {
  const response: AxiosResponse<AuthsessionDto> = await axios.get<AuthsessionDto>(`${systemBaseUri}/identityprovider/login`, {
    headers: {
      "Authorization": `Bearer ${apiKey}`
    }
  }).catch(e => {
    throw new Error(`Failed to get Authsession for given API-Key.\n${e}`);
  });

  return {
    id: response.data.AuthSessionId,
    expire: new Date(response.data.Expire)
  };
}