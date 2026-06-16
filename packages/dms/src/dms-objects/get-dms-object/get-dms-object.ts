import { DvelopContext, DvelopOptions, dvelopFetch } from "@dvelop-sdk/core";
import { ensureSuccessResponse } from "../../utils/dms-error";
import { DmsObjectNote, getDmsObjectNotes } from "../get-dms-object-notes/get-dms-object-notes";
import { fetchDmsObjectFile } from "../get-dms-object-file/get-dms-object-file";
import { searchDmsObjects, SearchDmsObjectsResultPage } from "../search-dms-objects/search-dms-objects";

/**
 * Parameters for the {@link getDmsObject}-function.
 * @category DmsObject
 */
export interface GetDmsObjectParams {
  /** ID of the repository */
  repositoryId: string;
  /** ID of the source */
  sourceId: string;
  /** ID of the DmsObject */
  dmsObjectId: string;
}

/**
 * A d.velop cloud dmsObject.
 * @category DmsObject
 */
export interface DmsObject {
  /** ID of the repository */
  repositoryId: string;
  /** ID of the source */
  sourceId: string;
  /** ID of the DmsObject */
  dmsObjectId: string;
  /** Category of the DmsObject */
  categories: string[];
  /** Properties of the DmsObject */
  properties: {
    /** Key of the DmsObject-Property */
    key: string;
    /** Value of the DmsObject-Property */
    value?: string;
    /** Values of the DmsObject-Property */
    values?: { [key: string]: string };
    /** Display-Value of the DmsObject-Property */
    displayValue?: string;
  }[];

  /** Function that returns the DmsObject-file. */
  getMainFile?: () => Promise<ArrayBuffer>;
  /** Function that returns the DmsObject-pdf. */
  getPdfFile?: () => Promise<ArrayBuffer>;
  /** Function that returns a searchresult of all children. */
  searchChildren?: () => Promise<SearchDmsObjectsResultPage>;
  /** Function that returns the notes of a DmsObject. */
  getNotes?: () => Promise<DmsObjectNote[]>;
}

/**
 * Default `onResponse` provided to the {@link getDmsObject}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category DmsObject
 */
export function onResponse(
  context: DvelopContext,
  params: GetDmsObjectParams
): (response: Response) => Promise<DmsObject> {
  return async (response: Response) => {
    await ensureSuccessResponse(response);
    const data: any = await response.json();
    console.log("getDmsObject response data", data);

    const dmsObject: DmsObject = {
      repositoryId: params.repositoryId,
      sourceId: params.sourceId,
      dmsObjectId: params.dmsObjectId,
      categories: data.sourceCategories,
      properties: data.sourceProperties
    };

    if (data._links?.mainblobcontent) {
      dmsObject.getMainFile = () => fetchDmsObjectFile(context, data._links.mainblobcontent.href);
    }

    if (data._links?.pdfblobcontent) {
      dmsObject.getPdfFile = () => fetchDmsObjectFile(context, data._links.pdfblobcontent.href);
    }

    if (data._links?.children) {
      dmsObject.searchChildren = () => searchDmsObjects(context, {
        repositoryId: params.repositoryId,
        sourceId: params.sourceId,
        childrenOf: params.dmsObjectId
      });
    }

    if (data._links?.notes) {
      dmsObject.getNotes = () => getDmsObjectNotes(context, params);
    }

    return dmsObject;
  };
}

/**
 * Get a DmsObject.
 *
 * ```typescript
 * import { getDmsObject } from "@dvelop-sdk/dms";
 *
 * const dmsObject: DmsObject = await getDmsObject({
 *   systemBaseUri: "https://steamwheedle-cartel.d-velop.cloud",
 *   authSessionId: "dQw4w9WgXcQ"
 * },{
 *   repositoryId: "qnydFmqHuVo",
 *   sourceId: "/dms/r/qnydFmqHuVo/source",
 *   dmsObjectId: "GDYQ3PJKrT8",
 * });
 *
 * console.log(dmsObject);
 * ```
 * @category DmsObject
 */
export async function getDmsObject(context: DvelopContext, params: GetDmsObjectParams): Promise<DmsObject>;
export async function getDmsObject<T>(context: DvelopContext, params: GetDmsObjectParams, options: DvelopOptions<T>): Promise<T>;
export async function getDmsObject<T>(
  context: DvelopContext,
  params: GetDmsObjectParams,
  options: DvelopOptions<T | DmsObject> = {
    onResponse: onResponse(context, params)
  }
): Promise<T | DmsObject> {
  return dvelopFetch(context, `/dms/r/${params.repositoryId}/o2m/${params.dmsObjectId}?sourceid=${params.sourceId}`, { method: "GET" }, options);
}
