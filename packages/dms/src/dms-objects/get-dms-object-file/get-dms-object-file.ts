import { DvelopContext, NotFoundError } from "../../index";
import { HttpConfig, HttpResponse, _defaultHttpRequestFunction } from "../../utils/http";
import { GetDmsObjectParams } from "../../dms-objects/get-dms-object/get-dms-object";

/**
 * Default transform-function provided to the {@link getDmsObjectMainFile}- and {@link getDmsObjectPdfFile}-function.
 * @internal
 * @category DmsObject
 */
export async function getDmsObjectFileDefaultTransformFunction(response: HttpResponse<ArrayBuffer>, _: DvelopContext, __: GetDmsObjectParams) {
  return response.data;
}

async function getDmsObjectBlobContentRespone(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse<ArrayBuffer>>,
  follow: string,
  context: DvelopContext,
  params: GetDmsObjectParams
): Promise<HttpResponse<ArrayBuffer>> {
  try {
    return await httpRequestFunction(context, {
      method: "GET",
      url: "/dms",
      headers: {
        "Accept": "application/octet-stream"
      },
      responseType: "arraybuffer",
      follows: ["repo", "dmsobjectwithmapping", follow],
      templates: {
        "repositoryid": params.repositoryId,
        "sourceid": params.sourceId,
        "dmsobjectid": params.dmsObjectId
      }
    });
  } catch (e: any) {
    if (e instanceof NotFoundError) {
      throw new NotFoundError(`No File found for dmsObject '${params.dmsObjectId} in repository ${params.repositoryId}.`);
    } else {
      throw e;
    }
  }
}

/**
 * Factory for {@link getDmsObjectMainFile}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @typeparam T Return type of the getRepositories-function. A corresponding transformFuntion has to be supplied.
 * @internal
 * @category DmsObject
 */
export function _getDmsObjectMainFileFactory<T>(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse<ArrayBuffer>, context: DvelopContext, params: GetDmsObjectParams) => T
): (context: DvelopContext, params: GetDmsObjectParams) => Promise<T> {
  return async (context: DvelopContext, params: GetDmsObjectParams) => {
    const response: HttpResponse<ArrayBuffer> = await getDmsObjectBlobContentRespone(httpRequestFunction, "mainblobcontent", context, params);
    return transformFunction(response, context, params);
  };
}

/**
 * Factory for {@link getDmsObjectPdfFile}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @typeparam T Return type of the getRepositories-function. A corresponding transformFuntion has to be supplied.
 * @internal
 * @category DmsObject
 */
export function _getDmsObjectPdfFileFactory<T>(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse<ArrayBuffer>, context: DvelopContext, params: GetDmsObjectParams) => T
): (context: DvelopContext, params: GetDmsObjectParams) => Promise<T> {
  return async (context: DvelopContext, params: GetDmsObjectParams) => {
    const response: HttpResponse<ArrayBuffer> = await getDmsObjectBlobContentRespone(httpRequestFunction, "pdfblobcontent", context, params);
    return transformFunction(response, context, params);
  };
}
/**
 * Download a DmsObject-file.
 *
 * ```typescript
 * import { getDmsObjectMainFile } from "@dvelop-sdk/dms";
 * import { writeFileSync } from "fs";
 *
 * const file: ArrayBuffer = await getDmsObjectMainFile({
 *   systemBaseUri: "https://steamwheedle-cartel.d-velop.cloud",
 *   authSessionId: "dQw4w9WgXcQ"
 * },{
 *   repositoryId: "qnydFmqHuVo",
 *   sourceId: "/dms/r/qnydFmqHuVo/source",
 *   dmsObjectId: "GDYQ3PJKrT8",
 * });
 *
 * writeFileSync(`${__dirname}/our-profits.kaching`, Buffer.from(file)); // only node.js
 * ```
 * @category DmsObject
 */
/* istanbul ignore next */
export async function getDmsObjectMainFile(context: DvelopContext, params: GetDmsObjectParams): Promise<ArrayBuffer> {
  return _getDmsObjectMainFileFactory(_defaultHttpRequestFunction, getDmsObjectFileDefaultTransformFunction)(context, params);
}

/**
 * Download a DmsObject-file as PDF.
 *
 * ```typescript
 * import { getDmsObjectPdfFile } from "@dvelop-sdk/dms";
 * import { writeFileSync } from "fs";
 *
 * const file: ArrayBuffer = await getDmsObjectPdfFile({
 *   systemBaseUri: "https://steamwheedle-cartel.d-velop.cloud",
 *   authSessionId: "dQw4w9WgXcQ"
 * },{
 *   repositoryId: "qnydFmqHuVo",
 *   sourceId: "/dms/r/qnydFmqHuVo/source",
 *   dmsObjectId: "GDYQ3PJKrT8",
 * });
 *
 * writeFileSync(`${__dirname}/our-profits.pdf`, Buffer.from(file)); // only node.js
 * ```
 * @category DmsObject
 */
/* istanbul ignore next */
export async function getDmsObjectPdfFile(context: DvelopContext, params: GetDmsObjectParams): Promise<ArrayBuffer> {
  return _getDmsObjectPdfFileFactory(_defaultHttpRequestFunction, getDmsObjectFileDefaultTransformFunction)(context, params);
}
