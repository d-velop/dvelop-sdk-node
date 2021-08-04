import axios, { AxiosResponse } from "axios";
import { Repository, UnauthorizedError } from "../../index";

interface RepositoriesDto {
  repositories: Repository[];
}

/**
 * Returns all {@link Repository}-objects for the tenant.
 *
 * @param systemBaseUri SystemBaseUri for the tenant
 * @param authSessionId Valid AuthSessionId
 * @throws {@link UnauthorizedError} indicates an invalid authSessionId or no authSessionId was sent.
 *
 * @category Repository
 *
 * @example ```typescript
 * const repos: Repository[] = await getRepositories("https://steamwheedle-cartel.d-velop.cloud", "dQw4w9WgXcQ");
 * const repoList: string = repos.map(r => r.name).join(", ");
 * console.log("Repositories:", repoList); // Booty Bay Documents, Everlook Documents, Ratchet Documents
 * ```
 */
export async function getRepositories(systemBaseUri: string, authSessionId: string): Promise<Repository[]> {

  const errorContext: string = "Failed to get repositories";

  try {
    const response: AxiosResponse<RepositoriesDto> = await axios.get<RepositoriesDto>("/dms", {
      baseURL: systemBaseUri,
      headers: {
        "Authorization": `Bearer ${authSessionId}`
      },
      follows: ["allrepos"]
    });

    return response.data.repositories;
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