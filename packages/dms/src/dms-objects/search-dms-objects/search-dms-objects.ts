import { DvelopContext } from "../../index";
import { defaultHttpRequestFunction, HttpConfig, HttpResponse } from "../../internals";

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

function listedDmsObjectDefaultTransformFunctionFactory(httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>): (dto: any, context: DvelopContext, params: SearchDmsObjectsParams) => ListedDmsObject {
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

export function searchDmsObjectsDefaultTransformFunctionFactory(httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>): (response: HttpResponse, context: DvelopContext, params: SearchDmsObjectsParams) => SearchDmsObjectsResultPage {
  return (response: HttpResponse, context: DvelopContext, params: SearchDmsObjectsParams) => {

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
export function searchDmsObjects(context: DvelopContext, params: SearchDmsObjectsParams): Promise<SearchDmsObjectsResultPage> {
  return searchDmsObjectsFactory(defaultHttpRequestFunction, searchDmsObjectsDefaultTransformFunctionFactory(defaultHttpRequestFunction))(context, params);
}