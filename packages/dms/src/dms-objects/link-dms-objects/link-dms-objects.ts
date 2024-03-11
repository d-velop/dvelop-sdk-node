import { DvelopContext, DvelopHttpRequestConfig, DvelopHttpResponse } from "@dvelop-sdk/core";
import { _defaultHttpRequestFunction } from "../../internal";

/**
 * Parameters for the {@link linkDmsObjects}-function.
 * @category DmsObject
 */
export interface LinkDmsObjectsParams {
  /** ID of the repository */
  repositoryId: string;
  /** ID of the source */
  sourceId: string;
  /** ID of the DmsObject that will be linked as parent */
  parentDmsObjectId: string;
  /** ID of the DmsObjects that will be linked as children */
  childDmsObjectsIds: string[];
}

/**
 * Factory for {@link linkDmsObjects}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @typeparam T Return type of the {@link linkDmsObjects}-function. A corresponding transformFunction has to be supplied.
 * @internal
 * @category DmsObject
 */
export function _linkDmsObjectsFactory<T>(
  httpRequestFunction: (context: DvelopContext, config: DvelopHttpRequestConfig) => Promise<DvelopHttpResponse>,
  transformFunction: (response: DvelopHttpResponse, context: DvelopContext, params: LinkDmsObjectsParams) => T
): (context: DvelopContext, params: LinkDmsObjectsParams) => Promise<T> {
  return async (context: DvelopContext, params: LinkDmsObjectsParams) => {

    const response: DvelopHttpResponse = await httpRequestFunction(context, {
      method: "POST",
      url: "/dms",
      follows: ["repo", "dmsobjectwithmapping", "linkDmsObject"],
      templates: {
        "repositoryid": params.repositoryId,
        "sourceid": params.sourceId,
        "dmsobjectid": params.parentDmsObjectId
      },
      data: {
        dmsObjectIds: params.childDmsObjectsIds
      }
    })

    return transformFunction(response, context, params);
  }
}

/**
 * Link a DmsObject to multiple child DmsObjects.
 *
 * ```typescript
 * import { linkDmsObjects } from "@dvelop-sdk/dms";
 *
 * await linkDmsObjects({
 *   systemBaseUri: "https://steamwheedle-cartel.d-velop.cloud",
 *   authSessionId: "dQw4w9WgXcQ"
 * }, {
 *   repositoryId: "qnydFmqHuVo",
 *   sourceId: "/dms/r/qnydFmqHuVo/source",
 *   parentDmsObjectId: "GDYQ3PJKrT8",
 *   childDmsObjectsIds: [
 *     "N3bEh-PEk1g",
 *     "AC86VI0j85M"
 *   ]
 * });
 *
 * ```
 * @category DmsObject
 */
/* istanbul ignore next */
export async function linkDmsObjects(context: DvelopContext, params: LinkDmsObjectsParams): Promise<void> {
  return _linkDmsObjectsFactory(_defaultHttpRequestFunction, () => { })(context, params);
}