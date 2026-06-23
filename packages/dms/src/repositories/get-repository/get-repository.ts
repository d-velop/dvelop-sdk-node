import { DvelopContext, DvelopOptions, dvelopFetch } from "@dvelop-sdk/core";
import { ensureSuccessResponse } from "../../utils/dms-error";

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
  repositoryId: string;
  /** Name of the repository */
  name: string;
  /** Id of the default-source of the repository */
  sourceId: string;
}

/**
 * Default transform-function provided to the {@link getRepository}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category Repository
 */
export async function onResponse(response: Response): Promise<Repository> {
  await ensureSuccessResponse(response);
  const data: any = await response.json();
  return {
    repositoryId: data.id,
    name: data.name,
    sourceId: data._links["source"].href
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
 *   repositoryId: "qnydFmqHuVo",
 * });
 *
 * console.log(repo.name);
 * ```
 *
 * @category Repository
 */
export async function getRepository(context: DvelopContext, params: GetRepositoryParams): Promise<Repository>;
export async function getRepository<T>(context: DvelopContext, params: GetRepositoryParams, options: DvelopOptions<T>): Promise<T>;
export async function getRepository<T>(
  context: DvelopContext,
  params: GetRepositoryParams,
  options: DvelopOptions<T | Repository> = {
    onResponse: onResponse
  }
): Promise<T | Repository> {
  return dvelopFetch(context, `/dms/r/${params.repositoryId}`, { method: "GET" }, options);
}
