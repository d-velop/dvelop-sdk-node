import axios, { AxiosResponse } from "axios";
import { AuthSession } from "./auth-session";

export interface AuthSessionDto {
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
 * const authSession: AuthSession = await getAuthSession("https://dharma-initiative.d-velop.cloud", "<API_KEY>");
 * console.log(authSession.id); //a valid authSessionId
 * console.log('still valid:', authSession.expire.getTime() > new Date().getTime()); //still valid: true
 * ```
 */
export async function getAuthSession(systemBaseUri: string, apiKey: string): Promise<AuthSession> {
  const response: AxiosResponse<AuthSessionDto> = await axios.get<AuthSessionDto>(`${systemBaseUri}/identityprovider/login`, {
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