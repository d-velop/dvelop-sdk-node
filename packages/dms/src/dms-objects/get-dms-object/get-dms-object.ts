import { AxiosResponse, getAxiosInstance, mapRequestError } from "../../utils/http";
import { Context } from "../../utils/context";
import { requestDmsObjectBlob } from "../get-dms-object-file/get-dms-object-file";

export interface GetDmsObjectParams {
  /** ID of the repository */
  repositoryId: string;
  /** ID of the source */
  sourceId: string;
  /** ID of the DmsObject */
  dmsObjectId: string;
  /** Short description of changes */
}

export interface DmsObject {
  /** ID of the repository */
  repositoryId: string;
  /** ID of the source */
  sourceId: string;
  /** ID of the DmsObject */
  id: string;
  /** Category of the DmsObject */
  categories: string[];
  /** Properties of the DmsObject */
  properties: {
    /** Key of the DmsObject-Property */
    key: string;
    /** Value of the DmsObject-Property */
    value: string;
    /** Values of the DmsObject-Property */
    values?: any;
    /** Display-Value of the DmsObject-Property */
    displayValue?: string;
  }[];

  getFile?: ()=> Promise<ArrayBuffer>;
  getPdf?: ()=> Promise<ArrayBuffer>;
}

export type GetDmsObjectTransformer<T> = (response: AxiosResponse<any>, context: Context, params: GetDmsObjectParams)=> T;

export const getDmsObjectDefaultTransformer: GetDmsObjectTransformer<DmsObject> = (response: AxiosResponse<any>, context: Context, params: GetDmsObjectParams) => {

  const dmsObject: DmsObject = {
    repositoryId: params.repositoryId,
    sourceId: params.sourceId,
    id: response.data?.id,
    categories: response.data?.sourceCategories,
    properties: response.data?.sourceProperties
  };

  if (response.data?._links?.mainblobcontent) {
    const url: string = response.data._links.mainblobcontent.href;
    dmsObject.getFile = async () => (await requestDmsObjectBlob(context, url)).data;
  }

  if (response.data?._links?.pdfblobcontent) {
    const url: string = response.data._links.pdfblobcontent.href;
    dmsObject.getPdf = async () => (await requestDmsObjectBlob(context, url)).data;
  }

  return dmsObject;
};

/**
 * Get a DmsObject from a repository of the DMS-App.
 *
 * @param context {@link Context}-object containing systemBaseUri and a valid authSessionId.
 * @param params {@link GetDmsObjectParams}-object containing repositoryId, sourceId and dmsObjectId.
 *
 * @category DmsObjects
 *
 * @example ```typescript
 * TODO
 * ```
 */
export async function getDmsObject(context: Context, params: GetDmsObjectParams): Promise<DmsObject>

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
export async function getDmsObject<T>(context: Context, params: GetDmsObjectParams, transform: GetDmsObjectTransformer<T>): Promise<T>
export async function getDmsObject(context: Context, params: GetDmsObjectParams, transform: GetDmsObjectTransformer<any> = getDmsObjectDefaultTransformer): Promise<any> {

  let response: AxiosResponse<any>;
  try {
    response = await getAxiosInstance().get("/dms", {
      baseURL: context.systemBaseUri,
      headers: {
        "Authorization": `Bearer ${context.authSessionId}`,
        "Accept": "application/hal+json"
      },
      follows: ["repo", "dmsobjectwithmapping"],
      templates: {
        "repositoryid": params.repositoryId,
        "dmsobjectid": params.dmsObjectId,
        "sourceid": params.sourceId
      }
    });

  } catch (e) {
    throw mapRequestError([400, 404], "Failed to get dmsObject", e);
  }

  return transform(response, context, params);
}