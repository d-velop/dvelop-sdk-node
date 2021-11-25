import { DvelopContext } from "../../index";
import { HttpConfig, HttpResponse, _defaultHttpRequestFunction } from "../../utils/http";
import { Repository } from "../get-repository/get-repository";

/**
 * Default transform-function provided to the {@link getRepositories}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category Repository
 */
export function _getRepositoriesDefaultTransformFunction(response: HttpResponse, _: DvelopContext): Repository[] {
  return response.data.repositories.map((repositoryDto: any) => {
    return {
      repositoryId: repositoryDto.id,
      name: repositoryDto.name,
      sourceId: repositoryDto._links["source"].href
    };
  });
}

/**
 * Factory for {@link getRepositories}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @typeparam T Return type of the getRepositories-function. A corresponding transformFuntion has to be supplied.
 * @internal
 * @category Repository
 */
export function _getRepositoriesFactory<T>(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: DvelopContext) => T
): (context: DvelopContext) => Promise<T> {
  return async (context: DvelopContext) => {
    const response: HttpResponse = await httpRequestFunction(context, {
      method: "GET",
      url: "/dms",
      follows: ["allrepos"]
    });
    return transformFunction(response, context);
  };
}

/**
 * Returns an array of all {@link Repository}-objects for a tenant.
 *
 * ```typescript
 * import { Repository, getRepositories } from "@dvelop-sdk/dms";
 *
 * const repos: Repository[] = await getRepositories({
 *   systemBaseUri: "https://steamwheedle-cartel.d-velop.cloud",
 *   authSessionId: "dQw4w9WgXcQ"
 * });
 * const repoList: string = repos.map(r => r.name).join(", ");
 * console.log("Repositories:", repoList); // Booty Bay, Everlook, Gadgetzan, Ratchet
 * ```
 *
 * @category Repository
 */
/* istanbul ignore next */
export async function getRepositories(context: DvelopContext): Promise<Repository[]> {
  return await _getRepositoriesFactory(_defaultHttpRequestFunction, _getRepositoriesDefaultTransformFunction)(context);
}