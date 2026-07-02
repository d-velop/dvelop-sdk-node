import { DvelopContext, DvelopOptions, dvelopFetch } from "@dvelop-sdk/core";
import { ensureSuccessResponse } from "../../utils/dms-error";

/**
 * Parameters for the {@link unlinkDmsObjects}-function.
 * @category DmsObject
 */
export interface UnlinkDmsObjectsParams {
  /** ID of the repository */
  repositoryId: string;
  /** ID of the DmsObject that will be linked as parent */
  parentDmsObjectId: string;
  /** ID of the DmsObjects that will be linked as children */
  childDmsObjectsId: string;
}

/**
 * Default transform-function provided to the {@link unlinkDmsObjects}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category DmsObject
 */
export async function onResponse(response: Response): Promise<void> {
  await ensureSuccessResponse(response);
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
 *   parentDmsObjectId: "GDYQ3PJKrT8",
 *   childDmsObjectsId: "N3bEh-PEk1g"
 * });
 * ```
 * @category DmsObject
 */
export async function unlinkDmsObjects(context: DvelopContext, params: UnlinkDmsObjectsParams): Promise<void>;
export async function unlinkDmsObjects<T>(context: DvelopContext, params: UnlinkDmsObjectsParams, options: DvelopOptions<T>): Promise<T>;
export async function unlinkDmsObjects<T>(
  context: DvelopContext,
  params: UnlinkDmsObjectsParams,
  options: DvelopOptions<T | void> = {
    onResponse: onResponse
  }
): Promise<T | void> {
  return dvelopFetch(context, `/dms/r/${params.repositoryId}/o2m/${params.parentDmsObjectId}/children/${params.childDmsObjectsId}`, { method: "DELETE" }, options);
}
