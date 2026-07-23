import { DvelopContext, DvelopOptions, dvelopFetch } from "@dvelop-sdk/core";
import { ensureSuccessResponse } from "../../utils/dms-error";

export type DmsObjectStatus = "Processing" | "Verification" | "Release";

/**
 * Parameters for the {@link updateDmsObjectStatus}-function.
 * @category DmsObject
 */
export interface UpdateDmsObjectStatusParams {
  /** ID of the repository */
  repositoryId: string;
  /** ID of the DmsObject */
  dmsObjectId: string;
  /** State of the dms Object */
  status: DmsObjectStatus;
  /** User or Group to which the DmsObject will be assigned. You can specify individual users as well as groups using IDs of the Identityprovider-App */
  editor?: string;
  /** Description of changes */
  alterationText?: string;
}

/**
 * Default transform-function provided to the {@link updateDmsObjectStatus}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category DmsObject
 */
export async function onResponse(response: Response): Promise<void> {
  await ensureSuccessResponse(response);
}


/**
 * Update a DmsObject's status.
 *
 * ```typescript
 * import { updateDmsObjectStatus } from "@dvelop-sdk/dms";
 *
 * await updateDmsObjectStatus({
 *   systemBaseUri: "https://steamwheedle-cartel.d-velop.cloud",
 *   authSessionId: "dQw4w9WgXcQ"
 * }, {
 *   repositoryId: "qnydFmqHuVo",
 *   dmsObjectId: "GDYQ3PJKrT8",
 *   alterationText: "Updated by SDK",
 *   status: "Processing",
 *   editor: "NQlcUY5zDUk"
 * });
 * ```
 *
 * @category DmsObject
 */
export async function updateDmsObjectStatus(context: DvelopContext, params: UpdateDmsObjectStatusParams): Promise<void>;
export async function updateDmsObjectStatus<T>(context: DvelopContext, params: UpdateDmsObjectStatusParams, options: DvelopOptions<T>): Promise<T>;
export async function updateDmsObjectStatus<T>(
  context: DvelopContext,
  params: UpdateDmsObjectStatusParams,
  options: DvelopOptions<T | void> = {
    onResponse: onResponse
  }
): Promise<T | void> {
  return dvelopFetch(context, `/dms/r/${params.repositoryId}/o2m/${params.dmsObjectId}/v/current`, {
    method: "PUT",
    body: JSON.stringify({
      sourceId: `/dms/r/${params.repositoryId}/source`,
      alterationText: params.alterationText,
      sourceProperties: {
        properties: [
          { key: "property_state", values: [params.status] },
          ...(params.editor ? [{ key: "property_editor", values: [params.editor] }] : [])
        ]
      }
    })
  }, options);
}
