import { DvelopContext, DvelopHttpRequestConfig, DvelopHttpResponse } from "@dvelop-sdk/core";
import { _defaultHttpRequestFunction } from "../../internal";

/**
 * Parameters for the {@link unlinkDmsObjects}-function.
 * @category DmsObject
 */
export interface UnlinkDmsObjectsParams {
  /** ID of the repository */
  repositoryId: string;
  /** ID of the source */
  sourceId: string;
  /** ID of the DmsObject that will be linked as parent */
  parentDmsObjectId: string;
  /** ID of the DmsObjects that will be linked as children */
  childDmsObjectsId: string;
}

/**
 * Factory for {@link unlinkDmsObjects}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @typeparam T Return type of the {@link unlinkDmsObjects}-function. A corresponding transformFuntion has to be supplied.
 * @internal
 * @category DmsObject
 */
export function _unlinkDmsObjectsFactory<T>(
  httpRequestFunction: (context: DvelopContext, config: DvelopHttpRequestConfig) => Promise<DvelopHttpResponse>,
  transformFunction: (response: DvelopHttpResponse, context: DvelopContext, params: UnlinkDmsObjectsParams) => T
): (context: DvelopContext, params: UnlinkDmsObjectsParams) => Promise<T> {
  return async (context: DvelopContext, params: UnlinkDmsObjectsParams) => {

    const response: DvelopHttpResponse = await httpRequestFunction(context, {
      method: "DELETE",
      url: `/dms/r/${params.repositoryId}/o2m/${params.parentDmsObjectId}/children/${params.childDmsObjectsId}`,
      params: {
        "sourceid": params.sourceId
      }
    })

    return transformFunction(response, context, params);
  }
}

/**
 * Unlink a DmsObject from a child DmsObject.
 *
 * ```typescript
 * import { unlinkDmsObjects } from "@dvelop-sdk/dms";
 *
 * await unlinkDmsObjects({
 *   systemBaseUri: "https://steamwheedle-cartel.d-velop.cloud",
 *   authSessionId: "dQw4w9WgXcQ"
 * }, {
 *   repositoryId: "qnydFmqHuVo",
 *   sourceId: "/dms/r/qnydFmqHuVo/source",
 *   parentDmsObjectId: "GDYQ3PJKrT8",
 *   childDmsObjectsId: "N3bEh-PEk1g"
 * });
 *
 * ```
 * @category DmsObject
 */
/* istanbul ignore next */
export async function unlinkDmsObjects(context: DvelopContext, params: UnlinkDmsObjectsParams): Promise<void> {
  return _unlinkDmsObjectsFactory(_defaultHttpRequestFunction, () => { })(context, params);
}