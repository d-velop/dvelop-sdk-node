import { DvelopContext, DmsError } from "../../index";
import { HttpConfig, HttpResponse, defaultHttpRequestFunction } from "../../internals";
import { GetDmsObjectParams } from "../get-dms-object/get-dms-object";
import { storeFileTemporarily, StoreFileTemporarilyParams } from "../store-file-temporarily/store-file-temporarily";

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
  contentUri?: string,

  /** URL at which the file is temporarily stored in the DMS-App. See ... for more information.  */
  contentLocationUri?: string

  /** File for the DmsObject. This will use the {@link storeFileTemporarily}-function and overwrite ```contentLocationUri```-property. */
  content?: ArrayBuffer,
}

/**
 * Default transform-function provided to the {@link createDmsObject}-function.
 * @internal
 * @category DmsObject
 */
export function createDmsObjectDefaultTransformFunction(response: HttpResponse<any>, _: DvelopContext, params: CreateDmsObjectParams): GetDmsObjectParams {

  const location: string = response.headers["location"];
  const matches: RegExpExecArray | null = /^.*\/(.*?)(\?|$)/.exec(location);

  if (matches) {
    return {
      repositoryId: params.repositoryId,
      sourceId: params.sourceId,
      dmsObjectId: matches[1]
    };
  } else {
    throw new DmsError(`Failed to parse dmsObjectId from '${location}'`);
  }
}

/**
 * Default store-file-function provided to the {@link createDmsObject}-function.
 * @internal
 * @category DmsObject
 */
export async function createDmsObjectDefaultStoreFileFunction(context: DvelopContext, params: CreateDmsObjectParams): Promise<{ setAs: "contentUri" | "contentLocationUri", uri: string }> {
  const uri: string = await storeFileTemporarily(context, params as StoreFileTemporarilyParams);
  return {
    setAs: "contentLocationUri",
    uri: uri
  };
}

/**
 * Factory for the {@link createDmsObject}-function. See internals for more information.
 * @typeparam T Return type of the {@link createDmsObject}-function. A corresponding transformFuntion has to be supplied.
 * @category DmsObject
 */
export function createDmsObjectFactory<T>(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: DvelopContext, params: CreateDmsObjectParams) => T,
  storeFileFunction: (context: DvelopContext, params: CreateDmsObjectParams) => Promise<{ setAs: "contentUri" | "contentLocationUri", uri: string }>
): (context: DvelopContext, params: CreateDmsObjectParams) => Promise<T> {

  return async (context: DvelopContext, params: CreateDmsObjectParams) => {

    if (!params.contentUri && !params.contentLocationUri && params.content) {
      const storedFileInfo: { setAs: "contentUri" | "contentLocationUri", uri: string } = await storeFileFunction(context, params);
      params[storedFileInfo.setAs] = storedFileInfo.uri;
    }

    const response: HttpResponse = await httpRequestFunction(context, {
      method: "POST",
      url: "/dms",
      follows: ["repo", "dmsobjectwithmapping"],
      templates: { "repositoryid": params.repositoryId },
      data: {
        "sourceId": params.sourceId,
        "sourceCategory": params.categoryId,
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
 *   dmsObjectId: "GDYQ3PJKrT8",
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
/* istanbul ignore next */
export async function createDmsObject(context: DvelopContext, params: CreateDmsObjectParams): Promise<GetDmsObjectParams> {
  return await createDmsObjectFactory(defaultHttpRequestFunction, createDmsObjectDefaultTransformFunction, createDmsObjectDefaultStoreFileFunction)(context, params);
}