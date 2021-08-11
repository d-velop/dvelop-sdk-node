import axios, { AxiosResponse } from "axios";
import { UnauthorizedError, RepositoryNotFoundError, _internals } from "../../index";


export interface RepositoryDto {
  _links: _internals.HalJsonLinks;
  id: string;
  name: string;
  supportsFulltextSearch: boolean;
  serverId: string;
  available: boolean;
  isDefault: boolean;
  version: string;
}

export interface Repository {
  id: string;
  name: string;
  sourceId: string;
}

export function transformRepositoryDtoToRepository(dto: RepositoryDto): Repository {
  return {
    id: dto.id,
    name: dto.name,
    sourceId: dto._links["source"].href
  };
}

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
export async function getRepository(systemBaseUri: string, authSessionId: string, repositoryId: string): Promise<Repository>;
export async function getRepository<T>(systemBaseUri: string, authSessionId: string, repositoryId: string, transform: (dto: RepositoryDto)=> T): Promise<T>;
export async function getRepository(systemBaseUri: string, authSessionId: string, repositoryId: string, transform: (dto: RepositoryDto)=> any = transformRepositoryDtoToRepository): Promise<any> {

  const errorContext: string = "Failed to get repository";
  let response: AxiosResponse<RepositoryDto>;

  try {
    response = await axios.get<RepositoryDto>("/dms", {
      baseURL: systemBaseUri,
      headers: {
        "Authorization": `Bearer ${authSessionId}`
      },
      follows: ["repo"],
      templates: { "repositoryid": repositoryId }
    });

    return transform(response.data);
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