import { DvelopContext } from "../../index";
import { HttpConfig, HttpResponse, defaultHttpRequestFunction } from "../../internals";
import { storeFileTemporarily, StoreFileTemporarilyParams } from "../store-file-temporarily/store-file-temporarily";

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

export function updateDmsObjectDefaultTransformFunction(_: HttpResponse, __: DvelopContext, ___: UpdateDmsObjectParams): void { } // no error indicates success. Returning void

export async function updateDmsObjectDefaultStoreFileFunction(context: DvelopContext, params: UpdateDmsObjectParams): Promise<{ setAs: "contentUri" | "contentLocationUri", uri: string }> {
  const uri: string = await storeFileTemporarily(context, params as StoreFileTemporarilyParams);
  return {
    setAs: "contentLocationUri",
    uri: uri
  };
}

export function updateDmsObjectFactory<T>(
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
 * TODO
 * ```
 *
 * @category DmsObject
 */
/* istanbul ignore next */
export function updateDmsObject(context: DvelopContext, params: UpdateDmsObjectParams): Promise<void> {
  return updateDmsObjectFactory<void>(defaultHttpRequestFunction, updateDmsObjectDefaultTransformFunction, updateDmsObjectDefaultStoreFileFunction)(context, params);
}