import axios from "axios";
import { UnauthorizedError } from "../index";

interface ImpersonatedAuthSessionDto {
  authSessionId: string;
}

/**
 * Provides a valid authSessionId for a user without login.
 *
 * @param {string} systemBaseUri SystemBaseUri for the tenant
 * @param {string} appSession A valid appSession
 * @param {string} userId User that should be impersonated
 * @returns Valid authSessionId for the given user
 *
 * //TODO: example
 */
export async function getImpersonatedAuthSessionId(systemBaseUri: string, appSession: string, userId: string): Promise<string> {

  const errorContext: string = "Failed to impersonate user";

  try {
    const response = await axios.get<ImpersonatedAuthSessionDto>("/identityprovider/impersonatesession", {
      baseURL: systemBaseUri,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/hal+json",
        "Authorization": `Bearer ${appSession}`
      },
      params: {
        userId: userId
      }
    });

    return response.data.authSessionId;
  } catch (e) {
    if (e.response) {
      switch (e.response.status) {
      case 401:
        throw new UnauthorizedError(errorContext, e.response);

        //TODO: 404 if user does not exist?
      }
    }
    e.message = `${errorContext}: ${e.message}`;
    throw e;
  }
}