import { TenantContext, GetDmsObjectParams, getDmsObject } from "../../index";
import { NotFoundError } from "../../utils/errors";
import { AxiosResponse, getAxiosInstance, mapRequestError } from "../../utils/http";

export type GetDmsObjectFileTransformer<T> = (response: AxiosResponse<ArrayBuffer>, context: TenantContext, params: GetDmsObjectParams)=> T;

export async function getDmsObjectFile(context: TenantContext, params: GetDmsObjectParams): Promise<ArrayBuffer>;
export async function getDmsObjectFile<T>(context: TenantContext, params: GetDmsObjectParams, transform: GetDmsObjectFileTransformer<T>): Promise<T>;
export async function getDmsObjectFile(context: TenantContext, params: GetDmsObjectParams, transform: GetDmsObjectFileTransformer<any> = (response) => response.data): Promise<any> {

  const getDmsObjectResponse: AxiosResponse<any> = await getDmsObject(context, params, (response: AxiosResponse) => response);

  let url: string;
  if (getDmsObjectResponse.data?._links?.mainblobcontent) {
    url = getDmsObjectResponse.data._links.mainblobcontent.href;
  } else {
    throw new NotFoundError("Failed to get dmsObjectFile", "No href for mainblobcontent indicating there is no file for this dmsObject.");
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
    throw new NotFoundError("Failed to get dmsObjectPdf", "No href for pdfblobcontent indicating there is no pdf for this dmsObject.");
  }

  const response: AxiosResponse<ArrayBuffer> = await requestDmsObjectBlob(context, url);
  return transform(response, context, params);
}

export async function requestDmsObjectBlob(context: TenantContext, url: string): Promise<AxiosResponse<ArrayBuffer>> {

  try {
    return await getAxiosInstance().get(url, {
      baseURL: context.systemBaseUri,
      headers: {
        "Authorization": `Bearer ${context.authSessionId}`,
        "Accept": "application/octet-stream"
      },
      responseType: "arraybuffer"
    });
  } catch (e) {
    throw mapRequestError([400, 404],  "Failed to download dmsObjectFile", e);
  }
}

