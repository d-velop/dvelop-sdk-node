import axios, { AxiosResponse } from "axios";
import { followHalJson } from "@dvelop-sdk/axios-hal-json";
import { UnauthorizedError } from "../errors";
import { AuthSession } from "./auth-session";
axios.interceptors.request.use(followHalJson);

export interface AuthSessionDto {
  AuthSessionId: string;
  Expire: string;
}

/**
 * Returns an [AuthSession]{@link AuthSession} based on an API-Key.
 *
 * **The AuthSessionId should be kept secret and never be publicly available.**
 *
 * @param {string} systemBaseUri SystemBaseUri for the tenant
 * @param {string} apiKey API-Key provided by the d.velop cloud
 * @returns {string}
 *
 * @throws {@link UnauthorizedError} indicates an invalid authSessionId or no authSessionId was sent.
 *
 * @example ```typescript
 *
 * const authSession: AuthSession = await getAuthSession("https://monster-ag.d-velop.cloud", "<API_KEY>");
 * console.log(authSession.id); //a valid authSessionId
 * console.log('still valid:', authSession.expire.getTime() > new Date().getTime()); //still valid: true
 * ```
 */
export async function getAuthSession(systemBaseUri: string, apiKey: string): Promise<AuthSession> {

  const errorContext: string = "Failed to get authSession";

  try {
    const response: AxiosResponse<AuthSessionDto> = await axios.get<AuthSessionDto>("/identityprovider", {
      baseURL: systemBaseUri,
      headers: {
        "Authorization": `Bearer ${apiKey}`
      },
      follows: ["login"]
    });

    return {
      id: response.data.AuthSessionId,
      expire: new Date(response.data.Expire)
    };
  } catch (e) {
    if (e.response) {
      switch (e.response.status) {
      case 401:
        throw new UnauthorizedError(errorContext, e.response);
      }
    }
    e.message = `${errorContext}: ${e.message}`;
    throw e;
  }
}