import { DvelopContext, DvelopOptions, dvelopFetch } from "@dvelop-sdk/core";
import { ensureSuccessResponse } from "../../utils/dms-error";
import { Repository } from "../get-repository/get-repository";

/**
 * Default transform-function provided to the {@link getRepositories}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category Repository
 */
export async function onResponse(response: Response): Promise<Repository[]> {
  await ensureSuccessResponse(response);
  const data: any = await response.json();
  return data.repositories.map((repo: any) => ({
    repositoryId: repo.id,
    name: repo.name,
    sourceId: `/dms/r/${repo.id}/source`
  }));
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
 * ```
 *
 * @category Repository
 */
export async function getRepositories(context: DvelopContext): Promise<Repository[]>;
export async function getRepositories<T>(context: DvelopContext, options: DvelopOptions<T>): Promise<T>;
export async function getRepositories<T>(
  context: DvelopContext,
  options: DvelopOptions<T | Repository[]> = {
    onResponse: onResponse
  }
): Promise<T | Repository[]> {
  return dvelopFetch(context, "/dms/r", { method: "GET" }, options);
}
