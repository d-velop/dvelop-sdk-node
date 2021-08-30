import { AxiosInstance, AxiosResponse } from "axios";
import { TenantContext, GetDmsObjectParams, getDmsObject, _http } from "../../index";

export type GetDmsObjectFileTransformer<T> = (response: AxiosResponse<ArrayBuffer>, context: TenantContext, params: GetDmsObjectParams)=> T;

export async function getDmsObjectFile(context: TenantContext, params: GetDmsObjectParams): Promise<ArrayBuffer>;
export async function getDmsObjectFile<T>(context: TenantContext, params: GetDmsObjectParams, transform: GetDmsObjectFileTransformer<T>): Promise<T>;
export async function getDmsObjectFile(context: TenantContext, params: GetDmsObjectParams, transform: GetDmsObjectFileTransformer<any> = (response) => response.data): Promise<any> {

  const getDmsObjectResponse: AxiosResponse<any> = await getDmsObject(context, params, (response: AxiosResponse) => response);

  let url: string;
  if (getDmsObjectResponse.data?._links?.mainblobcontent) {
    url = getDmsObjectResponse.data._links.mainblobcontent.href;
  } else {
    throw "error";
  }

  const response: AxiosResponse<ArrayBuffer> = await requestDmsObjectBlob(context, url);
  return transform(response, context, params);
}

export async function getDmsObjectPdf(context: TenantContext, params: GetDmsObjectParams): Promise<ArrayBuffer>;
export async function getDmsObjectPdf<T>(context: TenantContext, params: GetDmsObjectParams, transform: GetDmsObjectFileTransformer<T>): Promise<T>;
export async function getDmsObjectPdf(context: TenantContext, params: GetDmsObjectParams, transform: GetDmsObjectFileTransformer<any> = (response) => response.data): Promise<any> {

  const getDmsObjectResponse: AxiosResponse<any> = await getDmsObject(context, params, (response: AxiosResponse) => response);

  let url: string;
  if (getDmsObjectResponse.data?._links?.pdfblobcontent) {
    url = getDmsObjectResponse.data._links.pdfblobcontent.href;
  } else {
    // throw new ServiceDeniedError(errorContext, "No deletion-href found indicating missing permissions.");
    throw "error";
  }

  const response: AxiosResponse<ArrayBuffer> = await requestDmsObjectBlob(context, url);
  return transform(response, context, params);
}

export async function requestDmsObjectBlob(context: TenantContext, url: string): Promise<AxiosResponse<ArrayBuffer>> {

  const http: AxiosInstance = _http.getAxiosInstance();

  try {
    return await http.get(url, {
      baseURL: context.systemBaseUri,
      headers: {
        "Authorization": `Bearer ${context.authSessionId}`,
        "Accept": "application/octet-stream"
      },
      responseType: "arraybuffer"
    });

  } catch (e) {
    const errorContext = "Failed to download dmsObjectFile";
    if (_http.isAxiosError(e)) {
      throw _http.mapAxiosError(errorContext, e);
    } else {
      e.message = `${errorContext}: ${e.message}`;
      throw e;
    }
  }
}

