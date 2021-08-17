import axios, { AxiosResponse } from "axios";
import { TenantContext, BadRequestError, UnauthorizedError, NotFoundError, internals } from "../../index";

export interface GetRepositoryParams {
  repositoryId: string;
}

export interface GetRepositoryDto {
  _links: internals.HalJsonLinks;
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

export function transformGetRepositoryDto(response: AxiosResponse<GetRepositoryDto>): Repository {
  const dto: GetRepositoryDto = response.data;
  return {
    id: dto.id,
    name: dto.name,
    sourceId: dto._links["source"].href
  };
}

/**
 * Returns {@link Repository}-object for specified id.
 *
 * @param context A {@link TenantContext} object.
 * @param params A {@link GetRepositoryParams} containing the repositoryId.
 *
 * @throws {@link BadRequestError} indicates invalid method params.
 * @throws {@link UnauthorizedError} indicates an invalid authSessionId or no authSessionId was sent.
 * @throws {@link NotFoundError} indicates that no repository with the specified id exists.
 *
 * @category Repository
 *
 * @example ```typescript
 * import { Repository, getRepository } from "@dvelop-sdk/dms";
 *
 * const repo: Repository = await getRepository({ systemBaseUri: "https://steamwheedle-cartel.d-velop.cloud", authSessionId: "dQw4w9WgXcQ" }, {
 *   repositoryId: "21"
 * });
 * console.log(repo.name); //Booty Bay Documents
 * ```
 */
export async function getRepository(context: TenantContext, params: GetRepositoryParams): Promise<Repository>;
/**
 * An additional transform-function can be supplied. Check out the docs for more information.
 *
 * @param transform Transform-function for the {@link AxiosResponse}.
 *
 * @category Repository
 *
 * @example ```typescript
 * import { getRepository, internals } from "@dvelop-sdk/dms";
 *
 * const raw: internals.GetRepositoryDto = await getRepository<internals.GetRepositoryDto>(
 *   { systemBaseUri: "https://steamwheedle-cartel.d-velop.cloud", authSessionId: "dQw4w9WgXcQ" },
 *   { repositoryId: repoId },
 *   (dto: AxiosResponse<internals.GetRepositoryDto>) => dto.data
 * );
 * console.log(raw.name); //Booty Bay Documents
 *
 *
 * const name: string = await getRepository<string>(
 *   { systemBaseUri: "https://steamwheedle-cartel.d-velop.cloud", authSessionId: "dQw4w9WgXcQ" },
 *   { repositoryId: repoId },
 *   (dto: AxiosResponse<internals.GetRepositoryDto>) => dto.data.name
 * );
 * console.log(name); //Booty Bay Documents
 * ```
 */
export async function getRepository<T>(context: TenantContext, params: GetRepositoryParams, transform: (response: AxiosResponse<GetRepositoryDto>)=> T): Promise<T>;
export async function getRepository(context: TenantContext, params: GetRepositoryParams, transform: (response: AxiosResponse<GetRepositoryDto>)=> any = transformGetRepositoryDto): Promise<any> {

  try {
    const response: AxiosResponse<GetRepositoryDto> = await axios.get<GetRepositoryDto>("/dms", {
      baseURL: context.systemBaseUri,
      headers: {
        "Authorization": `Bearer ${context.authSessionId}`
      },
      follows: ["repo"],
      templates: { "repositoryid": params.repositoryId }
    });

    return transform(response);

  } catch (e) {

    const errorContext: string = "Failed to get repository";

    if (axios.isAxiosError(e))
      switch (e.response?.status) {
      case 400:
        throw new BadRequestError(errorContext, e);

      case 401:
        throw new UnauthorizedError(errorContext, e);

      case 404:
        throw new NotFoundError(errorContext, e);
      }

    e.message = `${errorContext}: ${e.message}`;
    throw e;
  }
}


