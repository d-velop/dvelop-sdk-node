import axios, { AxiosResponse } from "axios";
import { Repository, UnauthorizedError, internals } from "../../index";

export interface RepositoryListDto {
  _links: internals.HalJsonLinks;
  repositories: internals.RepositoryDto[];
  count: number;
  hasAdminRight: boolean;
}

export function transformRepositoryListDtoToRepositoryArray(dto: RepositoryListDto): Repository[];
export function transformRepositoryListDtoToRepositoryArray<T>(dto: RepositoryListDto, transformer: (dto: internals.RepositoryDto)=> T): T;
export function transformRepositoryListDtoToRepositoryArray(dto: RepositoryListDto, transform: (dto: internals.RepositoryDto)=> any = internals.transformRepositoryDtoToRepository): any {
  return dto.repositories.map(r => transform(r));
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
export async function getRepositories(systemBaseUri: string, authSessionId: string): Promise<Repository[]>;
export async function getRepositories<T>(systemBaseUri: string, authSessionId: string, transform: (dto: RepositoryListDto)=> T): Promise<T>;
export async function getRepositories(systemBaseUri: string, authSessionId: string, transform: (dto: RepositoryListDto)=> any = transformRepositoryListDtoToRepositoryArray): Promise<any>{

  const errorContext: string = "Failed to get repositories";

  try {
    const response: AxiosResponse<RepositoryListDto> = await axios.get<RepositoryListDto>("/dms", {
      baseURL: systemBaseUri,
      headers: {
        "Authorization": `Bearer ${authSessionId}`
      },
      follows: ["allrepos"]
    });

    return transform(response.data);
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