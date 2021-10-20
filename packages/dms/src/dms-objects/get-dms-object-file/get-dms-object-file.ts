import { DvelopContext, NotFoundError } from "../../index";
import { HttpConfig, HttpResponse, defaultHttpRequestFunction } from "../../internals";
import { GetDmsObjectParams } from "../../dms-objects/get-dms-object/get-dms-object";

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

export function getDmsObjectMainFileFactory<T>(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse<ArrayBuffer>, context: DvelopContext, params: GetDmsObjectParams) => T
): (context: DvelopContext, params: GetDmsObjectParams) => Promise<T> {
  return async (context: DvelopContext, params: GetDmsObjectParams) => {
    const response: HttpResponse<ArrayBuffer> = await getDmsObjectBlobContentRespone(httpRequestFunction, "mainblobcontent", context, params);
    return transformFunction(response, context, params);
  };
}

export function getDmsObjectPdfFileFactory<T>(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse<ArrayBuffer>, context: DvelopContext, params: GetDmsObjectParams) => T
): (context: DvelopContext, params: GetDmsObjectParams) => Promise<T> {
  return async (context: DvelopContext, params: GetDmsObjectParams) => {
    const response: HttpResponse<ArrayBuffer> = await getDmsObjectBlobContentRespone(httpRequestFunction, "pdfblobcontent", context, params);
    return transformFunction(response, context, params);
  };
}

/* istanbul ignore next */
export async function getDmsObjectMainFile(context: DvelopContext, params: GetDmsObjectParams): Promise<ArrayBuffer> {
  return getDmsObjectMainFileFactory(defaultHttpRequestFunction, getDmsObjectFileDefaultTransformFunction)(context, params);
}

/* istanbul ignore next */
export async function getDmsObjectPdfFile(context: DvelopContext, params: GetDmsObjectParams): Promise<ArrayBuffer> {
  return getDmsObjectPdfFileFactory(defaultHttpRequestFunction, getDmsObjectFileDefaultTransformFunction)(context, params);
}
