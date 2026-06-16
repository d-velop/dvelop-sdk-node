import { DvelopContext, DvelopOptions, dvelopFetch } from "@dvelop-sdk/core";
import { ensureSuccessResponse } from "../../utils/dms-error";

/**
 * Parameters for the {@link getMappings}-function.
 * @category Mappings
 */
export interface GetMappingsParams {
  /** ID of the repository */
  repositoryId: string;
  /** ID of the source */
  sourceId: string;
}

/**
 * A d.velop cloud dmsMapping.
 * @category Mappings
 */
export interface DmsMapping {
  /** ID of the source */
  sourceId: string;
  /** Name of the mapping */
  name: string;
  /** The mapped properties of the Mapping entry */
  mappingItems: {
    /** The DMS property id */
    destination: string;
    /** The source property id */
    source: string;
    /** The data type of the mapped field */
    type: number;
  }[];
}

/**
 * Default transform-function provided to the {@link getMappings}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category Mappings
 */
export async function onResponse(response: Response): Promise<DmsMapping[]> {
  await ensureSuccessResponse(response);
  const data: any = await response.json();
  return data.mappings.map((m: any): DmsMapping => ({
    sourceId: m.sourceId,
    name: m.name,
    mappingItems: m.mappingItems.map((item: any) => ({
      destination: item.destination,
      source: item.source,
      type: item.type
    }))
  }));
}

/**
 * Get a list of property mappings for a given source.
 *
 * ```typescript
 * import { getMappings } from "@dvelop-sdk/dms";
 *
 * const dmsMappings: DmsMapping[] = await getMappings({
 *   systemBaseUri: "https://steamwheedle-cartel.d-velop.cloud",
 *   authSessionId: "dQw4w9WgXcQ"
 * },{
 *   repositoryId: "qnydFmqHuVo",
 *   sourceId: "/dms/r/qnydFmqHuVo/source"
 * });
 *
 * console.log(dmsMappings);
 * ```
 * @category Mappings
 */
export async function getMappings(context: DvelopContext, params: GetMappingsParams): Promise<DmsMapping[]>;
export async function getMappings<T>(context: DvelopContext, params: GetMappingsParams, options: DvelopOptions<T>): Promise<T>;
export async function getMappings<T>(
  context: DvelopContext,
  params: GetMappingsParams,
  options: DvelopOptions<T | DmsMapping[]> = {
    onResponse: onResponse
  }
): Promise<T | DmsMapping[]> {
  return dvelopFetch(context, `/dms/r/${params.repositoryId}/m?sourceId=${params.sourceId}`, { method: "GET" }, options);
}
