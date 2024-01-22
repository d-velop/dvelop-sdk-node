import { DvelopContext } from "../../index";
import { HttpConfig, HttpResponse, _defaultHttpRequestFunction } from "../../utils/http";

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
 * Factory for the default-transform-function for the {@link getMappings}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category DmsObject
 */
export function _getDmsMappingDefaultTransformFunctionFactory() {
  return (response: HttpResponse<any>, _context: DvelopContext, _params: GetMappingsParams) => {

    const mappings: DmsMapping[] = [...response.data.mappings];

    return mappings;
  };
}

/**
 * Factory for {@link getMappings}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @typeparam T Return type of the {@link getMappings}-function. A corresponding transformFunction has to be supplied.
 * @internal
 * @category Mappings
 */
export function _getDmsMappingFactory<T>(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: DvelopContext, params: GetMappingsParams) => T
): (context: DvelopContext, params: GetMappingsParams) => Promise<T> {
  return async (context: DvelopContext, params: GetMappingsParams) => {

    const response: HttpResponse = await httpRequestFunction(context, {
      method: "GET",
      url: "/dms",
      follows: ["repo", "mappingconfig"],
      templates: {
        "repositoryid": params.repositoryId,
        "sourceid": params.sourceId,
      }
    });
    return transformFunction(response, context, params);
  };
}

/**
 * Factory for the default-transform-function for the {@link getMappings}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category Mappings
 */
/* istanbul ignore next */
export async function _getDmsMappingsDefaultTransformFunction(response: HttpResponse<any>, context: DvelopContext, params: GetMappingsParams) {
  return _getDmsMappingDefaultTransformFunctionFactory()(response, context, params);
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
/* istanbul ignore next */
export async function getMappings(context: DvelopContext, params: GetMappingsParams) {
  return _getDmsMappingFactory(_defaultHttpRequestFunction, _getDmsMappingsDefaultTransformFunction)(context, params);
}
