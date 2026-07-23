import { DvelopContext, DvelopOptions, dvelopFetch } from "@dvelop-sdk/core";
import { DmsError, ensureSuccessResponse } from "../../utils/dms-error";
import { GetDmsObjectParams } from "../get-dms-object/get-dms-object";
import { storeFileTemporarily } from "../store-file-temporarily/store-file-temporarily";

/**
 * Parameters for the {@link createDmsObject}-function.
 * @category DmsObject
 */
export interface CreateDmsObjectParams {
  /** ID of the repository */
  repositoryId: string;

  /** ID of the source. See Mapping for more information. */
  sourceId: string;

  /** ID of the category for the DmsObject */
  categoryId: string;

  /** Properties */
  properties?: {
    /** Id of the property */
    key: string,
    /** Value(s) - Single values must be given as an array of length 1 */
    values: string[];
  }[]

  /** Name of the file including its file-ending */
  fileName?: string;

  /** URL from which file can be downloaded. Has to be a relative URL reachable within the tenant */
  contentUri?: string;

  /** URL at which the file is temporarily stored in the DMS-App. See ... for more information.  */
  contentLocationUri?: string;

  /** File for the DmsObject. This will use the {@link storeFileTemporarily}-function and overwrite ```contentLocationUri```-property. */
  content?: ArrayBuffer;
}

/**
 * Default `onResponse` provided to the {@link createDmsObject}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category DmsObject
 */
export function onResponse(
  params: CreateDmsObjectParams
): (response: Response) => Promise<GetDmsObjectParams> {
  return async (response: Response) => {
    await ensureSuccessResponse(response);

    const location = response.headers.get("location") ?? "";
    const matches = /^.*\/(.*?)(\?|$)/.exec(location);

    if (matches) {
      return {
        repositoryId: params.repositoryId,
        sourceId: params.sourceId,
        dmsObjectId: matches[1]
      };
    }
    throw new DmsError(`Failed to parse dmsObjectId from '${location}'`);
  };
}

/**
 * Create a DmsObject.
 *
 * ```typescript
 * import { createDmsObject } from "@dvelop-sdk/dms";
 * import { readFileSync } from "fs";
 *
 * //only node.js
 * const file: ArrayBuffer = readFileSync(`${ __dirname }/our-profits.kaching`).buffer;
 *
 * const dmsObject: GetDmsObjectParams = await createDmsObject({
 *   systemBaseUri: "https://steamwheedle-cartel.d-velop.cloud",
 *   authSessionId: "dQw4w9WgXcQ"
 * }, {
 *   repositoryId: "qnydFmqHuVo",
 *   sourceId: "/dms/r/qnydFmqHuVo/source",
 *   categoryId: "GDYQ3PJKrT8",
 *   properties: [
 *     {
 *       key: "AaGK-fj-BAM",
 *       values: ["unpaid"]
 *     }
 *   ],
 *   fileName: "our-profits.kaching",
 *   content: file,
 * });
 * ```
 * @category DmsObject
 */
export async function createDmsObject(context: DvelopContext, params: CreateDmsObjectParams): Promise<GetDmsObjectParams>;
export async function createDmsObject<T>(context: DvelopContext, params: CreateDmsObjectParams, options: DvelopOptions<T>): Promise<T>;
export async function createDmsObject<T>(
  context: DvelopContext,
  params: CreateDmsObjectParams,
  options: DvelopOptions<T | GetDmsObjectParams> = {
    onResponse: onResponse(params)
  }
): Promise<T | GetDmsObjectParams> {

  if (!params.contentUri && !params.contentLocationUri && params.content) {
    params.contentLocationUri = await storeFileTemporarily(context, {
      repositoryId: params.repositoryId,
      content: params.content
    });
  }

  return dvelopFetch(context, `/dms/r/${params.repositoryId}/o2m`, {
    method: "POST",
    body: JSON.stringify({
      sourceId: params.sourceId,
      sourceCategory: params.categoryId,
      sourceProperties: { "properties": params.properties },
      filename: params.fileName,
      contentLocationUri: params.contentLocationUri,
      contentUri: params.contentUri
    })
  }, options);
}
