import { DvelopContext, DvelopOptions, dvelopFetch } from "@dvelop-sdk/core";
import { ensureSuccessResponse } from "../../utils/dms-error";
import { getDmsObjectMainFile } from "../get-dms-object-file/get-dms-object-file";

/**
 * Parameters for the {@link searchDmsObjects}-function.
 * @category DmsObject
 */
export interface SearchDmsObjectsParams {
  repositoryId: string,
  sourceId: string;
  categories?: string[];
  /** Properties */
  properties?: {
    /** Id of the property */
    key: string,
    /** Value(s) - Single values must be given as an array of length 1 */
    values: string[];
  }[]
  sortProperty?: string;
  ascending?: boolean;
  fulltext?: string;
  page?: number;
  pageSize?: number;
  childrenOf?: string;
}

/**
 * A listed version of d.velop cloud dmsObject. There might be more information available via the {@link getDmsObject}-function.
 * @category DmsObject
 */
export interface ListedDmsObject {
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
    value: string;
    /** Values of the DmsObject-Property */
    values?: any;
    /** Display-Value of the DmsObject-Property */
    displayValue?: string;
  }[];

  getMainFile?: () => Promise<ArrayBuffer>;
}

/**
 * Page of a searchResult. There might be more than one page.
 * @category DmsObject
 */
export interface SearchDmsObjectsResultPage {
  /** Current page-number */
  page: number;
  /** Array of {@link ListedDmsObject}s found */
  dmsObjects: ListedDmsObject[]
  /** Function that returns the previous page. Undefined if there is none. */
  getPreviousPage?: () => Promise<SearchDmsObjectsResultPage>;
  /** Function that returns the next page. Undefined if there is none. */
  getNextPage?: () => Promise<SearchDmsObjectsResultPage>;
}

/**
 * Factory for the default-transform-function for the {@link searchDmsObjects}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category DmsObject
 */
export function onResponseFactory(
  context: DvelopContext,
  params: SearchDmsObjectsParams
): (response: Response) => Promise<SearchDmsObjectsResultPage> {
  return async (response: Response) => {

    await ensureSuccessResponse(response);
    const data: any = await response.json();

    const result: SearchDmsObjectsResultPage = {
      page: data.page,
      dmsObjects: data.items.map((item: any) => {
        const result: ListedDmsObject = {
          repositoryId: params.repositoryId,
          sourceId: params.sourceId,
          dmsObjectId: item.id,
          categories: item.sourceCategories,
          properties: item.sourceProperties
        };

        if (item._links?.mainblobcontent) {
          result.getMainFile = async () => {
            return getDmsObjectMainFile(context, {
              repositoryId: params.repositoryId,
              sourceId: params.sourceId,
              dmsObjectId: item.id
            })
          }
        }

        return result;
      })
    }

    if (data._links?.prev) {
      result.getPreviousPage = async () => dvelopFetch(context, data._links.prev, { method: "GET" }, {
        onResponse: onResponseFactory(context, params)
      });
    }

    if (data._links?.next) {
      result.getNextPage = async () => dvelopFetch(context, data._links.next, { method: "GET" }, {
        onResponse: onResponseFactory(context, params)
      });
    }

    return result;
  };
}

/**
 * Execute a search and returns the search-result. This result might be partial due to the defined ```pageSize```-property.
 * You can navigate pages with the ```getPreviousPage```- and ```getNextPage```-functions. If functions are undefined the page does not exist.
 *
 * ```typescript
 * import { searchDmsObjects } from "@dvelop-sdk/dms";
 *
 * const searchResult: SearchDmsObjectsResultPage = await searchDmsObjects({
 *   systemBaseUri: "https://steamwheedle-cartel.d-velop.cloud",
 *   authSessionId: "dQw4w9WgXcQ"
 * },{
 *   repositoryId: "qnydFmqHuVo",
 *   sourceId: "/dms/r/qnydFmqHuVo/source",
 *   categories: ["TIfAkOBMf5A"],
 *   fulltext: "Ashenvale",
 *   properties: [{
 *     key: "AaGK-fj-BAM",
 *     values: ["unpaid"]
 *   }]
 * });
 * ```
 * @category DmsObject
 */
export async function searchDmsObjects(context: DvelopContext, params: SearchDmsObjectsParams): Promise<SearchDmsObjectsResultPage>;
export async function searchDmsObjects<T>(context: DvelopContext, params: SearchDmsObjectsParams, options: DvelopOptions<T>): Promise<T>;
export async function searchDmsObjects<T>(
  context: DvelopContext,
  params: SearchDmsObjectsParams,
  options: DvelopOptions<T | SearchDmsObjectsResultPage> = {
    onResponse: onResponseFactory(context, params)
  }
): Promise<T | SearchDmsObjectsResultPage> {
  return dvelopFetch(context, `/dms/r/${params.repositoryId}/srm`, { method: "GET" }, options);
}
