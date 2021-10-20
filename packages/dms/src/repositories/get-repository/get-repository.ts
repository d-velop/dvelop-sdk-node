import { DvelopContext } from "../../index";
import { HttpConfig, HttpResponse, defaultHttpRequestFunction } from "../../internals";

/**
 * Parameters for the {@link getRepository}-function.
 * @category Repository
 */
export interface GetRepositoryParams {
  /** Id of the repository */
  repositoryId: string;
}

/**
 * A d.velop cloud repository.
 * @category Repository
 */
export interface Repository {
  /** Id of the repository */
  id: string;
  /** Name of the repository */
  name: string;
  /** Id of the default-source of the repository */
  sourceId: string;
}

/**
 * Default transform-function provided to the {@link getRepository}-function.
 * @category Repository
 */
export function getRepositoryDefaultTransformFunction(response: HttpResponse, _: DvelopContext, __: GetRepositoryParams): Repository {
  const data: any = response.data;
  return {
    id: data.id,
    name: data.name,
    sourceId: data._links["source"].href
  };
}

/**
 * Factory for the {@link getRepository}-function. See internals for more information.
 * @typeparam T Return type of the {@link getRepository}-function. A corresponding transformFuntion has to be supplied.
 * @category Repository
 */
export function getRepositoryFactory<T>(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: DvelopContext, params: GetRepositoryParams) => T,
): (context: DvelopContext, params: GetRepositoryParams) => Promise<T> {
  return async (context: DvelopContext, params: GetRepositoryParams) => {
    const response: HttpResponse = await httpRequestFunction(context, {
      method: "GET",
      url: "/dms",
      follows: ["repo"],
      templates: { "repositoryid": params.repositoryId }
    });
    return transformFunction(response, context, params);
  };
}

/**
 * Returns the {@link Repository}-object with the specified id.
 *
 * ```typescript
 * import { Repository, getRepository } from "@dvelop-sdk/dms";
 *
 * const repo: Repository = await getRepository({
 *   systemBaseUri: "https://steamwheedle-cartel.d-velop.cloud",
 *   authSessionId: "dQw4w9WgXcQ"
 * }, {
 *   repositoryId: "169",
 * });
 * console.log(repo.name); // Booty Bay Documents
 * ```
 *
 * @category Repository
 */
/* istanbul ignore next */
export async function getRepository(context: DvelopContext, params: GetRepositoryParams): Promise<Repository> {
  return getRepositoryFactory(defaultHttpRequestFunction, getRepositoryDefaultTransformFunction)(context, params);
}
