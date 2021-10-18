import { Context } from "../../utils/context";
import { Repository } from "../get-repository/get-repository";
import { HttpConfig, HttpResponse, defaultHttpRequestFunction } from "../../utils/http";

/**
 * Default transform-function provided to the {@link getRepositories}-function.
 * @category Repository
 */
export function getRepositoriesDefaultTransformFunction(response: HttpResponse, _: Context): Repository[] {
  return response.data.repositories.map((repositoryDto: any) => {
    return {
      id: repositoryDto.id,
      name: repositoryDto.name,
      sourceId: repositoryDto._links["source"].href
    };
  });
}

/**
 * Factory for {@link getRepositories}-function. See internals for more information.
 * @typeparam T Return type of the getRepositories-function. A corresponding transformFuntion has to be supplied.
 * @category Repository
 */
export function getRepositoriesFactory<T>(
  httpRequestFunction: (context: Context, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: Context) => T
): (context: Context) => Promise<T> {
  return async (context: Context) => {
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
export async function getRepositories(context: Context): Promise<Repository[]> {
  return await getRepositoriesFactory(defaultHttpRequestFunction, getRepositoriesDefaultTransformFunction)(context);
}