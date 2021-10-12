import { AxiosResponse, HttpConfig, HttpResponse, defaultHttpRequestFunction } from "../../utils/http";
import { Context } from "../../utils/context";
import { getDmsObjectMainFile, getDmsObjectPdfFile } from "../get-dms-object-file/get-dms-object-file";

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

  getMainFile?: () => Promise<ArrayBuffer>;
  getPdfFile?: () => Promise<ArrayBuffer>;
}

export function getDmsObjectDefaultTransformFunctionFactory(
  getDmsObjectMainFileFunction: (context: Context, params: GetDmsObjectParams) => Promise<ArrayBuffer>,
  getDmsObjectPdfFileFunction: (context: Context, params: GetDmsObjectParams) => Promise<ArrayBuffer>
) {
  return (response: AxiosResponse<any>, context: Context, params: GetDmsObjectParams) => {

    const dmsObject: DmsObject = {
      repositoryId: params.repositoryId,
      sourceId: params.sourceId,
      id: params.dmsObjectId,
      categories: response.data.sourceCategories,
      properties: response.data.sourceProperties
    };

    if (response.data._links.mainblobcontent) {
      dmsObject.getMainFile = async () => (await getDmsObjectMainFileFunction(context, params));
    }

    if (response.data._links.pdfblobcontent) {
      dmsObject.getPdfFile = async () => (await getDmsObjectPdfFileFunction(context, params));
    }

    return dmsObject;
  };
}

export function getDmsObjectFactory<T>(
  httpRequestFunction: (context: Context, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: Context, params: GetDmsObjectParams) => T
): (context: Context, params: GetDmsObjectParams) => Promise<T> {
  return async (context: Context, params: GetDmsObjectParams) => {

    const response: HttpResponse = await httpRequestFunction(context, {
      method: "GET",
      url: "/dms",
      follows: ["repo", "dmsobjectwithmapping"],
      templates: {
        "repositoryid": params.repositoryId,
        "sourceid": params.sourceId,
        "dmsobjectid": params.dmsObjectId
      }
    });
    return transformFunction(response, context, params);
  };
}

/* istanbul ignore next */
export async function getDmsObjectDefaultTransformFunction(response: AxiosResponse<any>, context: Context, params: GetDmsObjectParams) {
  return getDmsObjectDefaultTransformFunctionFactory(getDmsObjectMainFile, getDmsObjectPdfFile)(response, context, params);
}

/* istanbul ignore next */
export async function getDmsObject(context: Context, params: GetDmsObjectParams) {
  return getDmsObjectFactory(defaultHttpRequestFunction, getDmsObjectDefaultTransformFunction)(context, params);
}
