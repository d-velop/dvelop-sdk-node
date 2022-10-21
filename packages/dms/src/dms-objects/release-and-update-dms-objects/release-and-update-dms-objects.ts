import { BadInputError, DvelopContext } from "@dvelop-sdk/core";
import { getDmsObject, GetDmsObjectParams, DmsObject, updateDmsObjectStatus, UpdateDmsObjectStatusParams, updateDmsObject, UpdateDmsObjectParams } from "../../index";
import { _defaultHttpRequestFunction, _getDmsObjectFactory, _getDmsObjectDefaultTransformFunctionFactory, _updateDmsObjectDefaultTransformFunction } from "../../internal";

/**
* This error indicates a problem with reading the DmsObject. Do you have all relevant permissions?
* @category Error
*/
export class ReleaseAndUpdateDmsObjectError extends Error {
  // eslint-disable-next-line no-unused-vars
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, ReleaseAndUpdateDmsObjectError.prototype);
  }
}

/**
 * Factory for the {@link releaseAndUpdateDmsObject}-function. This is a wrapper around {@link getDmsObject}, {@link updateDmsObjectStatus} and {@link updateDmsObject} combined.
 * @internal
 * @category DmsObject
 */
export function _releaseAndUpdateDmsObjectFactory(
  getDmsObjectsFunction: (context: DvelopContext, params: GetDmsObjectParams) => Promise<DmsObject>,
  updateDmsObjectStatusFunction: (context: DvelopContext, params: UpdateDmsObjectStatusParams) => Promise<void>,
  updateDmsObjectFunction: (context: DvelopContext, params: UpdateDmsObjectParams) => Promise<void>,
): (context: DvelopContext, params: UpdateDmsObjectParams) => Promise<void> {

  return async (context: DvelopContext, params: UpdateDmsObjectParams) => {

    const dmsObject: DmsObject = await getDmsObjectsFunction(context, {
      repositoryId: params.repositoryId,
      dmsObjectId: params.dmsObjectId,
      sourceId: params.sourceId
    });

    const state: string | undefined = dmsObject.properties?.find(p => p.key === "property_state")?.value;

    if (!state) {
      throw new ReleaseAndUpdateDmsObjectError("State of DmsObject could not be determined.")
    } else if (state !== "Released") {
      await updateDmsObjectStatusFunction(context, {
        repositoryId: params.repositoryId,
        dmsObjectId: params.dmsObjectId,
        status: "Release",
        alterationText: params.alterationText
      });
    }

    return updateDmsObjectFunction(context, params);
  }
}

/**
 * Release a DmsObject and update it. This is a variation of {@link updateDmsObject} which has the same syntax.
 *
 * Internally this this is a wrapper around {@link getDmsObject}, {@link updateDmsObjectStatus} and {@link updateDmsObject}:
 *   - {@link getDmsObject}
 *   - if dmsObjects **not** released
 *     - {@link updateDmsObjectStatus}
 *   - {@link updateDmsObject}
 *
 * ```typescript
 * import { updateDmsObject } from "@dvelop-sdk/dms";
 * import { readFileSync } from "fs";
 *
 * //only node.js
 * const file: ArrayBuffer = readFileSync(`${ __dirname }/our-profits.kaching`).buffer;
 *
 * await updateDmsObject({
 *   systemBaseUri: "https://steamwheedle-cartel.d-velop.cloud",
 *   authSessionId: "dQw4w9WgXcQ"
 * }, {
 *   repositoryId: "qnydFmqHuVo",
 *   sourceId: "/dms/r/qnydFmqHuVo/source",
 *   dmsObjectId: "GDYQ3PJKrT8",
 *   alterationText: "Updated by SDK",
 *   properties: [
 *     {
 *       key: "AaGK-fj-BAM",
 *       values: ["paid"]
 *     }
 *   ],
 *   fileName: "our-profits.kaching",
 *   content: file,
 *   alterationText: "Released for automatic update"
 * });
 * ```
 *
 * @category DmsObject
 */
/* istanbul ignore next */
export function releaseAndUpdateDmsObject(context: DvelopContext, params: UpdateDmsObjectParams): Promise<void> {
  return _releaseAndUpdateDmsObjectFactory(getDmsObject, updateDmsObjectStatus, updateDmsObject)(context, params);
}
