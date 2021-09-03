import { Context } from "../../utils/context";
import { AxiosResponse, getAxiosInstance, mapRequestError } from "../../utils/http";

export interface GetRepositoryParams {
  repositoryId: string;
}

export interface Repository {
  id: string;
  name: string;
  sourceId: string;
}

export type GetRepositoryTransformer<T> = (response: AxiosResponse<any>, context: Context, params: GetRepositoryParams)=> T;

export const getRepositoryDefaultTransformer: GetRepositoryTransformer<Repository> = (response: AxiosResponse<any>, _: Context, __: GetRepositoryParams) => {
  const dto: any = response.data;
  return {
    id: dto.id,
    name: dto.name,
    sourceId: dto._links["source"].href
  };
};

/**
 * Returns {@link Repository}-object for specified id.
 *
 * @param context A {@link Context} object.
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
export async function getRepository(context: Context, params: GetRepositoryParams): Promise<Repository>;
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
export async function getRepository<T>(context: Context, params: GetRepositoryParams, transform: GetRepositoryTransformer<T>): Promise<T>;
export async function getRepository(context: Context, params: GetRepositoryParams, transform: GetRepositoryTransformer<any> = getRepositoryDefaultTransformer): Promise<any> {

  let response: AxiosResponse<any>;
  try {
    response = await getAxiosInstance().get("/dms", {
      baseURL: context.systemBaseUri,
      headers: {
        "Authorization": `Bearer ${context.authSessionId}`
      },
      follows: ["repo"],
      templates: { "repositoryid": params.repositoryId }
    });
  } catch (e) {
    throw mapRequestError([404], "Failed to get repository", e);
  }

  return transform(response, context, params);
}


