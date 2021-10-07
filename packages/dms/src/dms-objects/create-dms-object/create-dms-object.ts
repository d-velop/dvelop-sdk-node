import { DmsError } from "../../utils/errors";
import { AxiosResponse, HttpConfig, HttpResponse, defaultHttpRequestFunction } from "../../utils/http";
import { Context } from "../../utils/context";
import { GetDmsObjectParams } from "../get-dms-object/get-dms-object";
import { storeFileTemporarily, StoreFileTemporarilyParams } from "../store-file-temporarily/store-file-temporarily";

const errorContext = "Failed to create dmsObject";

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

export function createDmsObjectDefaultTransformFunction(response: AxiosResponse<any>, _: Context, params: CreateDmsObjectParams): GetDmsObjectParams {

  const location: string = response.headers["location"];
  const matches: RegExpExecArray | null = /^.*\/(.*?)(\?|$)/.exec(location);

  if (matches) {
    return {
      repositoryId: params.repositoryId,
      sourceId: params.sourceId,
      dmsObjectId: matches[1]
    };
  } else {
    throw new DmsError(errorContext, undefined, `Failed to parse dmsObjectId from '${location}'`);
  }
}

export async function createDmsObjectDefaultStoreFileFunction(context: Context, params: CreateDmsObjectParams): Promise<{ setAs: "contentUri" | "contentLocationUri", uri: string }> {
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
  httpRequestFunction: (context: Context, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: Context, params: CreateDmsObjectParams) => T,
  storeFileFunction: (context: Context, params: CreateDmsObjectParams) => Promise<{ setAs: "contentUri" | "contentLocationUri", uri: string }>
): (context: Context, params: CreateDmsObjectParams) => Promise<T> {

  return async (context: Context, params: CreateDmsObjectParams) => {

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
 * // nodejs
 * import { readFileSync } from "fs";
 *
 * const file: ArrayBuffer = readFileSync(`${ __dirname } /chicken.pdf`).buffer;
 *
 * const dmsObject: GetDmsObjectParams = await createDmsObject(context, {
 *   repositoryId: repoId,
 *   categoryId: "3ed080ff-ca5f-4248-a0e9-8234ba3abe11",
 *   sourceId: `/dms/r/${repoId}/source`,
 *   fileName: 'chicken.pdf',
 *   file: file
 * });
 * ```
 * @category DmsObject
 */
/* istanbul ignore next */
export async function createDmsObject(context: Context, params: CreateDmsObjectParams): Promise<GetDmsObjectParams> {
  return await createDmsObjectFactory(defaultHttpRequestFunction, createDmsObjectDefaultTransformFunction, createDmsObjectDefaultStoreFileFunction)(context, params);
}