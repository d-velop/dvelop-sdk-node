import { DvelopContext, DvelopOptions, dvelopFetch } from "@dvelop-sdk/core";
import { ensureSuccessResponse } from "../../utils/dms-error";

/**
 * Parameters for the {@link deleteCurrentDmsObjectVersion}-function.
 * @category DmsObject
 */
export interface DeleteCurrentDmsObjectVersionParams {
  /** ID of the repository */
  repositoryId: string;
  /** ID of the source */
  sourceId: string;
  /** ID of the DmsObject */
  dmsObjectId: string;
  /** Reason for the deletion */
  reason: string;
}

/**
 * Default transform-function provided to the {@link deleteCurrentDmsObjectVersion}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 *
 * Resolves to `true` when no further version exists (the DmsObject is fully deleted)
 * and to `false` when the response indicates that another version can still be deleted.
 * @internal
 * @category DmsObject
 */
export async function onResponse(response: Response): Promise<boolean> {
  await ensureSuccessResponse(response);

  let data: any;
  try {
    data = await response.clone().json();
  } catch {
    data = undefined;
  }

  return !(data?._links?.deleteWithReason || data?._links?.delete);
}

/**
 * Deletes the current (last) version of a DmsObject. The version before that automatically becomes the current version.
 * @returns Boolean value indicating if the dmsObject was completly deleted (aka: You just deleted the first version)
 *
 * ```typescript
 * import { deleteCurrentDmsObjectVersion } from "@dvelop-sdk/dms";
 *
 * await deleteCurrentDmsObjectVersion({
 *   systemBaseUri: "https://steamwheedle-cartel.d-velop.cloud",
 *   authSessionId: "dQw4w9WgXcQ"
 * }, {
 *     repositoryId: "qnydFmqHuVo",
 *     sourceId: "/dms/r/qnydFmqHuVo/source",
 *     dmsObjectId: "GDYQ3PJKrT8",
 *     reason: "This shall be gone! Tout de suite!"
 *   });
 * ```
 *
 * @category DmsObject
 */
export async function deleteCurrentDmsObjectVersion(context: DvelopContext, params: DeleteCurrentDmsObjectVersionParams): Promise<boolean>;
export async function deleteCurrentDmsObjectVersion<T>(context: DvelopContext, params: DeleteCurrentDmsObjectVersionParams, options: DvelopOptions<T>): Promise<T>;
export async function deleteCurrentDmsObjectVersion<T>(
  context: DvelopContext,
  params: DeleteCurrentDmsObjectVersionParams,
  options: DvelopOptions<T | boolean> = {
    onResponse: onResponse
  }
): Promise<T | boolean> {
  return dvelopFetch(context, `/dms/r/${params.repositoryId}/o2m/${params.dmsObjectId}`, {
    method: "DELETE",
    body: JSON.stringify({ reason: params.reason })
  }, options);
}
