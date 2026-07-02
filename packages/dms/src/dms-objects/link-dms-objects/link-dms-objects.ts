import { DvelopContext, DvelopOptions, dvelopFetch } from "@dvelop-sdk/core";
import { ensureSuccessResponse } from "../../utils/dms-error";

/**
 * Parameters for the {@link linkDmsObjects}-function.
 * @category DmsObject
 */
export interface LinkDmsObjectsParams {
  /** ID of the repository */
  repositoryId: string;
  /** ID of the DmsObject that will be linked as parent */
  parentDmsObjectId: string;
  /** ID of the DmsObjects that will be linked as children */
  childDmsObjectsIds: string[];
}

/**
 * Default transform-function provided to the {@link linkDmsObjects}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category DmsObject
 */
export async function onResponse(response: Response): Promise<void> {
  await ensureSuccessResponse(response);
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
 *   parentDmsObjectId: "GDYQ3PJKrT8",
 *   childDmsObjectsIds: ["N3bEh-PEk1g", "AC86VI0j85M"]
 * });
 * ```
 * @category DmsObject
 */
export async function linkDmsObjects(context: DvelopContext, params: LinkDmsObjectsParams): Promise<void>;
export async function linkDmsObjects<T>(context: DvelopContext, params: LinkDmsObjectsParams, options: DvelopOptions<T>): Promise<T>;
export async function linkDmsObjects<T>(
  context: DvelopContext,
  params: LinkDmsObjectsParams,
  options: DvelopOptions<T | void> = {
    onResponse: onResponse
  }
): Promise<T | void> {
  return dvelopFetch(context, `/dms/r/${params.repositoryId}/o2m/${params.parentDmsObjectId}/children`, {
    method: "POST",
    body: JSON.stringify({ dmsObjectIds: params.childDmsObjectsIds })
  }, options);
}
