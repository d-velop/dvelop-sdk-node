import { AxiosResponse, getAxiosInstance, mapRequestError } from "../../utils/http";
import { Context } from "../../utils/context";
import { storeFileTemporarily } from "../store-file-temporarily/store-file-femporarily";

export interface UpdateDmsObjectParams {
  /** ID of the repository */
  repositoryId: string;
  /** ID of the source */
  sourceId: string;
  /** ID of the DmsObject */
  dmsObjectId: string;
  /** Short description of changes */
  alterationText: string;
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

export type UpdateDmsObjectTransformer<T> = (response: AxiosResponse<void>, context: Context, params: UpdateDmsObjectParams)=> T;

/**
 * Update a DmsObject in the DMS-App.
 *
 * @param context {@link Context}-object containing systemBaseUri and a valid authSessionId
 * @param params {@link UpdateDmsObjectParams}-object.
 *
 * @throws {@link BadRequestError} indicates invalid method params. See the ```err.requestError.response.data```-propterty for more information.
 * @throws {@link UnauthorizedError} indicates an invalid authSessionId or no authSessionId was sent.
 * @throws {@link NotFOundError} indicates an invalid combination of repositoryId, sourceId and dmsObjectId
 *
 * @category DmsObjects
 *
 * @example ```typescript
 * TODO
 * ```
 */
export async function updateDmsObject(context: Context, params: UpdateDmsObjectParams): Promise<void>;

/**
 * An additional transform-function can be supplied. Check out the docs for more information.
 *
 * @param transform Transformer for the {@link AxiosResponse}.
 *
 * @category DmsObjects
 *
 * @example ```typescript
 * TODO
 * ```
 */
export async function updateDmsObject<T>(context: Context, params: UpdateDmsObjectParams, transform: UpdateDmsObjectTransformer<T>): Promise<T>;
export async function updateDmsObject(context: Context, params: UpdateDmsObjectParams, transform: UpdateDmsObjectTransformer<any> = () => { }): Promise<any> {

  if (params.content && !params.contentLocationUri) {
    params.contentLocationUri = await storeFileTemporarily(context, {
      repositoryId: params.repositoryId,
      file: params.content
    });
  }

  let response: AxiosResponse<void>;
  try {
    response = await getAxiosInstance().put<void>("/dms", {
      sourceId: params.sourceId,
      alterationText: params.alterationText,
      sourceProperties: {
        properties: params.properties
      },
      fileName: params.fileName,
      contentLocationUri: params.contentLocationUri,
      contentUri: params.contentUri
    }, {
      baseURL: context.systemBaseUri,
      follows: ["repo", "dmsobjectwithmapping", "update"],
      templates: {
        "repositoryid": params.repositoryId,
        "dmsobjectid": params.dmsObjectId,
        "sourceid": params.sourceId
      },
      headers: {
        "Authorization": `Bearer ${context.authSessionId}`,
        "Accept": "application/hal+json",
        "Content-Type": "application/hal+json"
      }
    });

  } catch (e: any) {
    throw mapRequestError([400, 404], "Failed to update dmsObject", e);
  }

  return transform(response, context, params);
}