import { DvelopContext } from "../../index";
import { HttpConfig, HttpResponse, _defaultHttpRequestFunction } from "../../utils/http";
import { storeFileTemporarily, StoreFileTemporarilyParams } from "../store-file-temporarily/store-file-temporarily";

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
 * Default transform-function provided to the {@link updateDmsObject}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category DmsObject
 */
export function _updateDmsObjectDefaultTransformFunction(_: HttpResponse, __: DvelopContext, ___: UpdateDmsObjectParams): void { } // no error indicates success. Returning void

/**
 * Default storeFile-function provided to the {@link updateDmsObject}-function. This will get called when content is provided. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category DmsObject
 */
export async function updateDmsObjectDefaultStoreFileFunction(context: DvelopContext, params: UpdateDmsObjectParams): Promise<{ setAs: "contentUri" | "contentLocationUri", uri: string }> {
  const uri: string = await storeFileTemporarily(context, params as StoreFileTemporarilyParams);
  return {
    setAs: "contentLocationUri",
    uri: uri
  };
}

/**
 * Factory for the {@link updateDmsObject}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @typeparam T Return type of the {@link updateDmsObject}-function. A corresponding transformFunction has to be supplied.
 * @internal
 * @category DmsObject
 */
export function _updateDmsObjectFactory<T>(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: DvelopContext, params: UpdateDmsObjectParams) => T,
  storeFileFunction: (context: DvelopContext, params: UpdateDmsObjectParams) => Promise<{ setAs: "contentUri" | "contentLocationUri", uri: string }>
): (context: DvelopContext, params: UpdateDmsObjectParams) => Promise<T> {
  return async (context: DvelopContext, params: UpdateDmsObjectParams) => {

    if (!params.contentUri && !params.contentLocationUri && params.content) {
      const storedFileInfo: { setAs: "contentUri" | "contentLocationUri", uri: string } = await storeFileFunction(context, params);
      params[storedFileInfo.setAs] = storedFileInfo.uri;
    }

    const response: HttpResponse = await httpRequestFunction(context, {
      method: "PUT",
      url: "/dms",
      follows: ["repo", "dmsobjectwithmapping", "update"],
      templates: {
        "repositoryid": params.repositoryId,
        "sourceid": params.sourceId,
        "dmsobjectid": params.dmsObjectId
      },
      data: {
        "sourceId": params.sourceId,
        "alterationText": params.alterationText,
        "sourceProperties": {
          "properties": params.properties
        },
        "fileName": params.fileName,
        "contentLocationUri": params.contentLocationUri,
        "contentUri": params.contentUri
      }
    });
    return transformFunction(response, context, params);
  };
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
/* istanbul ignore next */
export function updateDmsObject(context: DvelopContext, params: UpdateDmsObjectParams): Promise<void> {
  return _updateDmsObjectFactory<void>(_defaultHttpRequestFunction, _updateDmsObjectDefaultTransformFunction, updateDmsObjectDefaultStoreFileFunction)(context, params);
}