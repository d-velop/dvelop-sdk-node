import { AxiosResponse, getAxiosInstance, mapRequestError } from "../../utils/http";
import { TenantContext } from "../../utils/tenant-context";
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

  fileName?: string;
  file?: string | ArrayBuffer;
}

export type UpdateDmsObjectTransformer<T> = (response: AxiosResponse<void>, context: TenantContext, params: UpdateDmsObjectParams)=> T;

/**
 * Update a DmsObject in the DMS-App.
 *
 * @param context {@link TenantContext}-object containing systemBaseUri and a valid authSessionId
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
export async function updateDmsObject(context: TenantContext, params: UpdateDmsObjectParams): Promise<void>;

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
export async function updateDmsObject<T>(context: TenantContext, params: UpdateDmsObjectParams, transform: UpdateDmsObjectTransformer<T>): Promise<T>;
export async function updateDmsObject(context: TenantContext, params: UpdateDmsObjectParams, transform: UpdateDmsObjectTransformer<any> = () => { }): Promise<any> {

  let data: any = {
    sourceId: params.sourceId,
    alterationText: params.alterationText
  };

  if (params.properties && params.properties.length > 0) {
    data.sourceProperties = {
      properties: params.properties
    };
  }

  if (params.file && params.file instanceof ArrayBuffer) {
    data.fileName = params.fileName;
    data.contentLocationUri = await storeFileTemporarily(context, {
      repositoryId: params.repositoryId,
      file: params.file
    });
  } else if (params.file && typeof params.file === "string") {
    data.fileName = params.fileName;
    data.contentLocationUri = params.file;
  }

  let response: AxiosResponse<void>;
  try {
    response = await getAxiosInstance().put<void>("/dms", data, {
      baseURL: context.systemBaseUri,
      headers: {
        "Authorization": `Bearer ${context.authSessionId}`,
        "Accept": "application/hal+json",
        "Content-Type": "application/hal+json"
      },
      follows: ["repo", "dmsobjectwithmapping", "update"],
      templates: {
        "repositoryid": params.repositoryId,
        "dmsobjectid": params.dmsObjectId,
        "sourceid": params.sourceId
      }
    });
  } catch (e) {
    throw mapRequestError([400, 404], "Failed to update dmsObject", e);
  }

  return transform(response, context, params);
}