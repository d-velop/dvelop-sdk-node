import { DvelopContext } from "../../index";
import { HttpConfig, HttpResponse, _defaultHttpRequestFunction } from "../../utils/http";
import { getDmsObjectMainFile, getDmsObjectPdfFile } from "../get-dms-object-file/get-dms-object-file";

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
  /** Short description of changes */
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
}

/**
 * Factory for the default-transform-function for the {@link getDmsObject}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category DmsObject
 */
export function _getDmsObjectDefaultTransformFunctionFactory(
  getDmsObjectMainFileFunction: (context: DvelopContext, params: GetDmsObjectParams) => Promise<ArrayBuffer>,
  getDmsObjectPdfFileFunction: (context: DvelopContext, params: GetDmsObjectParams) => Promise<ArrayBuffer>
) {
  return (response: HttpResponse<any>, context: DvelopContext, params: GetDmsObjectParams) => {

    const dmsObject: DmsObject = {
      repositoryId: params.repositoryId,
      sourceId: params.sourceId,
      dmsObjectId: params.dmsObjectId,
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

/**
 * Factory for {@link getDmsObject}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @typeparam T Return type of the {@link getDmsObject}-function. A corresponding transformFuntion has to be supplied.
 * @internal
 * @category DmsObject
 */
export function _getDmsObjectFactory<T>(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: DvelopContext, params: GetDmsObjectParams) => T
): (context: DvelopContext, params: GetDmsObjectParams) => Promise<T> {
  return async (context: DvelopContext, params: GetDmsObjectParams) => {

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

/**
 * Factory for the default-transform-function for the {@link getDmsObject}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category DmsObject
 */
/* istanbul ignore next */
export async function _getDmsObjectDefaultTransformFunction(response: HttpResponse<any>, context: DvelopContext, params: GetDmsObjectParams) {
  return _getDmsObjectDefaultTransformFunctionFactory(getDmsObjectMainFile, getDmsObjectPdfFile)(response, context, params);
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
/* istanbul ignore next */
export async function getDmsObject(context: DvelopContext, params: GetDmsObjectParams) {
  return _getDmsObjectFactory(_defaultHttpRequestFunction, _getDmsObjectDefaultTransformFunction)(context, params);
}
