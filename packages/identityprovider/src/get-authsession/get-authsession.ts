import axios, { AxiosResponse } from "axios";
import { Authsession } from "./authsession";

export interface AuthsessionDto {
  AuthSessionId: string;
  Expire: string;
}

/**
 * Returns an [AuthSession]{@link AuthSession} based on an API-Key.
 * **The AuthSessionId should be kept secret and never be publicly available**
 * @param {string} systemBaseUri SystemBaseUri for the tenant.
 * @param {string} apiKey API-Key provided by the d.velop cloud.
 * @returns {string}
 *
 * @example ```typescript
 * const authsession: Authsession = getAuthsession("https://monster-ag.d-velop.cloud", "<API_KEY>");
 * console.log(authsession.id); //return a valid authsessionId
 * console.log('still valid:', authsession.expire.getTime() > new Date().getTime()); //still valid: true
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