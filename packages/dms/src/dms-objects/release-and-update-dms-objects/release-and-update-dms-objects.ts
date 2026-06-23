import { DvelopContext } from "@dvelop-sdk/core";
import { DmsError } from "../../utils/dms-error";
import { getDmsObject } from "../get-dms-object/get-dms-object";
import { updateDmsObject, UpdateDmsObjectParams } from "../update-dms-object/update-dms-object";
import { updateDmsObjectStatus } from "../update-dms-object-status/update-dms-object-status";

/**
 * Release a DmsObject and update it. This is a variation of {@link updateDmsObject} which has the same syntax.
 *
 * Internally this this is a wrapper around {@link getDmsObject}, {@link updateDmsObjectStatus} and {@link updateDmsObject}:
 *   - {@link getDmsObject}
 *   - if dmsObjects **not** released
 *     - {@link updateDmsObjectStatus}
 *   - {@link updateDmsObject}
 *
 * @category DmsObject
 */
export async function releaseAndUpdateDmsObject(context: DvelopContext, params: UpdateDmsObjectParams): Promise<void> {

  const dmsObject = await getDmsObject(context, {
    repositoryId: params.repositoryId,
    dmsObjectId: params.dmsObjectId,
    sourceId: params.sourceId
  });

  const state = dmsObject.properties?.find(p => p.key === "property_state")?.value;

  if (!state) {
    throw new DmsError("State of DmsObject could not be determined.");
  }

  if (state !== "Released") {
    await updateDmsObjectStatus(context, {
      repositoryId: params.repositoryId,
      dmsObjectId: params.dmsObjectId,
      status: "Release",
      alterationText: params.alterationText
    });
  }

  return updateDmsObject(context, params);
}
