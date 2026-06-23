import { DvelopContext, DvelopOptions, dvelopFetch } from "@dvelop-sdk/core";
import { ensureSuccessResponse } from "../../utils/dms-error";
import { storeFileTemporarily } from "../store-file-temporarily/store-file-temporarily";

/**
 * Parameters for the {@link updateDmsObject}-function.
 * @category DmsObject
 */
export interface UpdateDmsObjectParams {
  /** ID of the repository */
  repositoryId: string;
  /** ID of the source */
  sourceId: string;
  /** ID of the DmsObject */
  dmsObjectId: string;
  /** Description of changes */
  alterationText: string;
  /** Id of a category to which the dmsObject should be moved */
  categoryId?: string;
  /** Property-Updates - Only listed properties will be changed */
  properties?: {
    /** Id of the property */
    key: string,
    /** Value(s) - Single values must be given as an array of length 1 */
    values: string[];
  }[];

  /** Name of the file including its file-ending */
  fileName?: string;

  /** URL from which file can be downloaded. Has to be a relative URL reachable within the tenant */
  contentUri?: string,

  /** URL at which the file is temporarily stored in the DMS-App. See ... for more information.  */
  contentLocationUri?: string

  /** File for the DmsObject. This will use the {@link storeFileTemporarily}-function and overwrite ```contentLocationUri```-property. */
  content?: ArrayBuffer
}

/**
 * Default `onResponse` provided to the {@link updateDmsObject}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category DmsObject
 */
export async function onResponse(response: Response): Promise<void> {
  await ensureSuccessResponse(response);
}

/**
 * Update a DmsObject.
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
 * });
 * ```
 *
 * @category DmsObject
 */
export async function updateDmsObject(context: DvelopContext, params: UpdateDmsObjectParams): Promise<void>;
export async function updateDmsObject<T>(context: DvelopContext, params: UpdateDmsObjectParams, options: DvelopOptions<T>): Promise<T>;
export async function updateDmsObject<T>(
  context: DvelopContext,
  params: UpdateDmsObjectParams,
  options: DvelopOptions<T | void> = {
    onResponse: onResponse
  }
): Promise<T | void> {
  if (!params.contentUri && !params.contentLocationUri && params.content) {
    params.contentLocationUri = await storeFileTemporarily(context, {
      repositoryId: params.repositoryId,
      content: params.content
    });
  }

  return dvelopFetch(context, `/dms/r/${params.repositoryId}/o2m/${params.dmsObjectId}`, {
    method: "PUT",
    body: JSON.stringify({
      sourceId: params.sourceId,
      alterationText: params.alterationText,
      sourceCategory: params.categoryId,
      sourceProperties: { "properties": params.properties },
      fileName: params.fileName,
      contentLocationUri: params.contentLocationUri,
      contentUri: params.contentUri
    })
  }, options);
}
