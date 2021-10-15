import { NoHalJsonLinksInResponseError } from "@dvelop-sdk/axios-hal-json";
import { GetDmsObjectParams } from "../../dms-objects/get-dms-object/get-dms-object";
import { Context } from "../../utils/context";
import { HttpConfig, HttpResponse, defaultHttpRequestFunction, NotFoundError } from "../../utils/http";

export async function getDmsObjectFileDefaultTransformFunction(response: HttpResponse<ArrayBuffer>, _: Context, __: GetDmsObjectParams) {
  return response.data;
}

async function getDmsObjectBlobContentRespone(
  httpRequestFunction: (context: Context, config: HttpConfig) => Promise<HttpResponse<ArrayBuffer>>,
  follow: string,
  context: Context,
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
    if (e instanceof NoHalJsonLinksInResponseError) {
      throw new NotFoundError(`No File found for dmsObject '${params.dmsObjectId} in repository ${params.repositoryId}.`);
    } else {
      throw e;
    }
  }
}

export function getDmsObjectMainFileFactory<T>(
  httpRequestFunction: (context: Context, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse<ArrayBuffer>, context: Context, params: GetDmsObjectParams) => T
): (context: Context, params: GetDmsObjectParams) => Promise<T> {
  return async (context: Context, params: GetDmsObjectParams) => {
    const response: HttpResponse<ArrayBuffer> = await getDmsObjectBlobContentRespone(httpRequestFunction, "mainblobcontent", context, params);
    return transformFunction(response, context, params);
  };
}

export function getDmsObjectPdfFileFactory<T>(
  httpRequestFunction: (context: Context, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse<ArrayBuffer>, context: Context, params: GetDmsObjectParams) => T
): (context: Context, params: GetDmsObjectParams) => Promise<T> {
  return async (context: Context, params: GetDmsObjectParams) => {
    const response: HttpResponse<ArrayBuffer> = await getDmsObjectBlobContentRespone(httpRequestFunction, "pdfblobcontent", context, params);
    return transformFunction(response, context, params);
  };
}

/* istanbul ignore next */
export async function getDmsObjectMainFile(context: Context, params: GetDmsObjectParams): Promise<ArrayBuffer> {
  return getDmsObjectMainFileFactory(defaultHttpRequestFunction, getDmsObjectFileDefaultTransformFunction)(context, params);
}

/* istanbul ignore next */
export async function getDmsObjectPdfFile(context: Context, params: GetDmsObjectParams): Promise<ArrayBuffer> {
  return getDmsObjectPdfFileFactory(defaultHttpRequestFunction, getDmsObjectFileDefaultTransformFunction)(context, params);
}
