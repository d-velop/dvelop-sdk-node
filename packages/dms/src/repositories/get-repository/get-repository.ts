import axios, { AxiosResponse } from "axios";
import { Repository, UnauthorizedError, RepositoryNotFoundError } from "../../index";

/**
 * Returns {@link Repository}-object for specified id.
 *
 * @param systemBaseUri SystemBaseUri for the tenant
 * @param authSessionId Valid AuthSessionId
 * @param repositoryId Id for the repository
 * @throws {@link UnauthorizedError} indicates an invalid authSessionId or no authSessionId was sent.
 * @throws {@link RepositoryNotFoundError} indicates that no repository with the specified id exists.
 *
 * @category Repository
 *
 * @example ```typescript
 * const repo: Repository = await getRepository("https://steamwheedle-cartel.d-velop.cloud", "dQw4w9WgXcQ", "21");
 * console.log(repo.name); // Booty Bay Documents
 * ```
 */
export async function getRepository(systemBaseUri: string, authSessionId: string, repositoryId: string): Promise<Repository>{

  const errorContext: string = "Failed to get repository";

  try {
    const response: AxiosResponse<Repository> = await axios.get<Repository>("/dms", {
      baseURL: systemBaseUri,
      headers: {
        "Authorization": `Bearer ${authSessionId}`
      },
      follows: ["repo"],
      templates: { "repositoryid": repositoryId }
    });

    return response.data;
  } catch (e) {
    if (e.response) {
      switch (e.response.status) {
      case 401:
        throw new UnauthorizedError(errorContext, e.response);

      case 404:
        throw new RepositoryNotFoundError(errorContext, repositoryId, e.response);
      }
    }
    e.message = `${errorContext}: ${e.message}`;
    throw e;
  }
}