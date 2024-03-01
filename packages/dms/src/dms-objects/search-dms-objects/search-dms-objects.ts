import { DvelopContext } from "../../index";
import { HttpConfig, HttpResponse, _defaultHttpRequestFunction } from "../../utils/http";

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
function _listedDmsObjectDefaultTransformFunctionFactory(httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>): (dto: any, context: DvelopContext, params: SearchDmsObjectsParams) => ListedDmsObject {
  return (dto: any, context: DvelopContext, params: SearchDmsObjectsParams) => {

    const result: ListedDmsObject = {
      repositoryId: params.repositoryId,
      sourceId: params.sourceId,
      dmsObjectId: dto.id,
      categories: dto.sourceCategories,
      properties: dto.sourceProperties
    };

    if (dto._links?.mainblobcontent) {
      result.getMainFile = async () => {
        const mainBlobContentResponse = await httpRequestFunction(context, {
          method: "GET",
          url: dto._links.mainblobcontent.href,
          headers: { "Accept": "application/octet-stream" },
          responseType: "arraybuffer"
        });
        return mainBlobContentResponse.data;
      };
    }

    return result;
  };
}

/**
 * Factory for the default-transform-function for the {@link searchDmsObjects}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category DmsObject
 */
export function _searchDmsObjectsDefaultTransformFunctionFactory(httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>): (response: HttpResponse, context: DvelopContext, params: SearchDmsObjectsParams) => SearchDmsObjectsResultPage {
  return (response: HttpResponse, context: DvelopContext, params: SearchDmsObjectsParams) => {

    const result: SearchDmsObjectsResultPage = {
      page: response.data.page,
      dmsObjects: response.data.items.map((item: any) => _listedDmsObjectDefaultTransformFunctionFactory(httpRequestFunction)(item, context, params))
    };

    if (response.data._links?.prev) {
      result.getPreviousPage = async () => {
        const prevResponse: HttpResponse = await httpRequestFunction(context, {
          method: "GET",
          url: response.data._links.prev.href
        });
        return _searchDmsObjectsDefaultTransformFunctionFactory(httpRequestFunction)(prevResponse, context, params);
      };
    }

    if (response.data._links?.next) {
      result.getNextPage = async () => {
        const nextResponse: HttpResponse = await httpRequestFunction(context, {
          method: "GET",
          url: response.data._links.next.href
        });
        return _searchDmsObjectsDefaultTransformFunctionFactory(httpRequestFunction)(nextResponse, context, params);
      };
    }

    return result;
  };
}

function formatProperties(properties: { key: string, values: string[] }[]): { [key: string]: string[] } {

  const sourceProperties: { [key: string]: string[] } = {};
  properties.forEach(p => {
    if (sourceProperties[p.key]) {
      sourceProperties[p.key] = sourceProperties[p.key].concat(p.values);
    } else {
      sourceProperties[p.key] = p.values;
    }
  });
  return sourceProperties;
}

/**
 * Factory for the {@link searchDmsObjects}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @typeparam T Return type of the {@link storeFileFunction}-function. A corresponding transformFunction has to be supplied.
 * @internal
 * @category DmsObject
 */
export function searchDmsObjectsFactory<T>(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: DvelopContext, params: SearchDmsObjectsParams) => T
): (context: DvelopContext, params: SearchDmsObjectsParams) => Promise<T> {
  return async (context: DvelopContext, params: SearchDmsObjectsParams) => {

    const templates: { [key: string]: any } = {
      "repositoryid": params.repositoryId,
      "sourceid": params.sourceId,
    };
    if (params.categories) {
      templates["sourcecategories"] = params.categories;
    }
    if (params.properties) {
      templates["sourceproperties"] = formatProperties(params.properties);
    }
    if (params.sortProperty) {
      templates["sourcepropertysort"] = params.sortProperty;
    }
    if (params.ascending) {
      templates["ascending"] = params.ascending;
    }
    if (params.fulltext) {
      templates["fulltext"] = params.fulltext;
    }
    if (params.page) {
      templates["page"] = params.page;
    }
    if (params.pageSize) {
      templates["pagesize"] = params.pageSize;
    }
    if (params.childrenOf) {
      templates["children_of"] = params.childrenOf;
    }

    const response: HttpResponse = await httpRequestFunction(context, {
      method: "GET",
      url: "/dms",
      follows: ["repo", "searchresultwithmapping"],
      templates: templates
    });

    return transformFunction(response, context, params);
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
 *   categories: ["TIfAkOBMf5A"]
 *   fulltext: "Ashenvale",
 *   properties: [{
 *     key: "AaGK-fj-BAM",
 *     values: ["unpaid"]
 *   }]
 * });
 *
 * console.log(searchResult.dmsObjects.length);
 * ```
 * @category DmsObject
 */
/* istanbul ignore next */
export function searchDmsObjects(context: DvelopContext, params: SearchDmsObjectsParams): Promise<SearchDmsObjectsResultPage> {
  return searchDmsObjectsFactory(_defaultHttpRequestFunction, _searchDmsObjectsDefaultTransformFunctionFactory(_defaultHttpRequestFunction))(context, params);
}