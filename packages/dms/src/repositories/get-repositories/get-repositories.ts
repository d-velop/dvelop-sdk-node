import axios, { AxiosResponse } from "axios";
import { TenantContext, Repository, UnauthorizedError, internals } from "../../index";

export interface GetRepositoryListDto {
  _links: internals.HalJsonLinks;
  repositories: internals.GetRepositoryDto[];
  count: number;
  hasAdminRight: boolean;
}

export function transformGetRepositoryListDto(response: AxiosResponse<GetRepositoryListDto>): Repository[] {
  const dtos: internals.GetRepositoryDto[] = response.data.repositories;
  return dtos.map(dto => {
    return {
      id: dto.id,
      name: dto.name,
      sourceId: dto._links["source"].href
    };
  });
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
export async function getRepositories(context: TenantContext): Promise<Repository[]>;
export async function getRepositories<T>(context: TenantContext, transform: (response: AxiosResponse<GetRepositoryListDto>)=> T): Promise<T>;
export async function getRepositories(context: TenantContext, transform: (response: AxiosResponse<GetRepositoryListDto>)=> any = transformGetRepositoryListDto): Promise<any> {

  try {
    const response: AxiosResponse<GetRepositoryListDto> = await axios.get<GetRepositoryListDto>("/dms", {
      baseURL: context.systemBaseUri,
      headers: {
        "Authorization": `Bearer ${context.authSessionId}`
      },
      follows: ["allrepos"]
    });

    return transform(response);
  } catch (e) {

    const errorContext: string = "Failed to get repositories";

    if (axios.isAxiosError(e)) {
      switch (e.response?.status) {
      case 401:
        throw new UnauthorizedError(errorContext, e);
      }
    }
    e.message = `${errorContext}: ${e.message}`;
    throw e;
  }
}