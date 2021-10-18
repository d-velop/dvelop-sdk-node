import { Context } from "../../utils/context";
import { defaultHttpRequestFunction, HttpConfig, HttpResponse } from "../../utils/http";

export interface SearchDmsObjectsParams {
  repositoryId: string,
  sourceId: string;
  categories?: string[];
  properties?: { [key: string]: string[] };
  sortProperty?: string;
  ascending?: boolean;
  fulltext?: string;
  page?: number;
  pageSize?: number;
}

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

export interface SearchDmsObjectsResultPage {
  page: number;
  dmsObjects: ListedDmsObject[]
  getPreviousPage?: () => Promise<SearchDmsObjectsResultPage>;
  getNextPage?: () => Promise<SearchDmsObjectsResultPage>;
}

function listedDmsObjectDefaultTransformFunctionFactory(httpRequestFunction: (context: Context, config: HttpConfig) => Promise<HttpResponse>): (dto: any, context: Context, params: SearchDmsObjectsParams) => ListedDmsObject {
  return (dto: any, context: Context, params: SearchDmsObjectsParams) => {

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

export function searchDmsObjectsDefaultTransformFunctionFactory(httpRequestFunction: (context: Context, config: HttpConfig) => Promise<HttpResponse>): (response: HttpResponse, context: Context, params: SearchDmsObjectsParams) => SearchDmsObjectsResultPage {
  return (response: HttpResponse, context: Context, params: SearchDmsObjectsParams) => {

    const result: SearchDmsObjectsResultPage = {
      page: response.data.page,
      dmsObjects: response.data.items.map((item: any) => listedDmsObjectDefaultTransformFunctionFactory(httpRequestFunction)(item, context, params))
    };

    if (response.data._links?.prev) {
      result.getPreviousPage = async () => {
        const prevResponse: HttpResponse = await httpRequestFunction(context, {
          method: "GET",
          url: response.data._links.prev.href
        });
        return searchDmsObjectsDefaultTransformFunctionFactory(httpRequestFunction)(prevResponse, context, params);
      };
    }

    if (response.data._links?.next) {
      result.getNextPage = async () => {
        const nextResponse: HttpResponse = await httpRequestFunction(context, {
          method: "GET",
          url: response.data._links.next.href
        });
        return searchDmsObjectsDefaultTransformFunctionFactory(httpRequestFunction)(nextResponse, context, params);
      };
    }

    return result;
  };
}

export function searchDmsObjectsFactory<T>(
  httpRequestFunction: (context: Context, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: Context, params: SearchDmsObjectsParams) => T
): (context: Context, params: SearchDmsObjectsParams) => Promise<T> {
  return async (context: Context, params: SearchDmsObjectsParams) => {

    const templates: { [key: string]: string } = {
      "repositoryid": params.repositoryId,
      "sourceid": params.sourceId,
    };
    if (params.categories) {
      templates["sourcecategories"] = encodeURIComponent(JSON.stringify(params.categories));
    }
    if (params.properties) {
      templates["sourceproperties"] = encodeURIComponent(JSON.stringify(params.properties));
    }
    if (params.sortProperty) {
      templates["sourcepropertysort"] = params.sortProperty;
    }
    if (params.ascending) {
      templates["ascending"] = encodeURIComponent(params.ascending);
    }
    if (params.fulltext) {
      templates["fulltext"] = params.fulltext;
    }
    if (params.page) {
      templates["page"] = encodeURIComponent(params.page);
    }
    if (params.pageSize) {
      templates["pagesize"] = encodeURIComponent(params.pageSize);
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

/* istanbul ignore next */
export function searchDmsObjects(context: Context, params: SearchDmsObjectsParams): Promise<SearchDmsObjectsResultPage> {
  return searchDmsObjectsFactory(defaultHttpRequestFunction, searchDmsObjectsDefaultTransformFunctionFactory(defaultHttpRequestFunction))(context, params);
}