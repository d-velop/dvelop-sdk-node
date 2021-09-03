import { Context, GetDmsObjectParams, getDmsObject } from "../../index";
import { NotFoundError } from "../../utils/errors";
import { AxiosResponse, getAxiosInstance, mapRequestError } from "../../utils/http";

export type GetDmsObjectFileTransformer<T> = (response: AxiosResponse<ArrayBuffer>, context: Context, params: GetDmsObjectParams)=> T;

export async function getDmsObjectFile(context: Context, params: GetDmsObjectParams): Promise<ArrayBuffer>;
export async function getDmsObjectFile<T>(context: Context, params: GetDmsObjectParams, transform: GetDmsObjectFileTransformer<T>): Promise<T>;
export async function getDmsObjectFile(context: Context, params: GetDmsObjectParams, transform: GetDmsObjectFileTransformer<any> = (response) => response.data): Promise<any> {

  const getDmsObjectResponse: AxiosResponse<any> = await getDmsObject(context, params, (response: AxiosResponse) => response);

  let url: string;
  if (getDmsObjectResponse.data?._links?.mainblobcontent) {
    url = getDmsObjectResponse.data._links.mainblobcontent.href;
  } else {
    throw new NotFoundError("Failed to get dmsObjectFile", undefined, "No href for mainblobcontent indicating there is no file for this dmsObject.");
  }

  const response: AxiosResponse<ArrayBuffer> = await requestDmsObjectBlob(context, url);
  return transform(response, context, params);
}

export async function getDmsObjectPdf(context: Context, params: GetDmsObjectParams): Promise<ArrayBuffer>;
export async function getDmsObjectPdf<T>(context: Context, params: GetDmsObjectParams, transform: GetDmsObjectFileTransformer<T>): Promise<T>;
export async function getDmsObjectPdf(context: Context, params: GetDmsObjectParams, transform: GetDmsObjectFileTransformer<any> = (response) => response.data): Promise<any> {

  const getDmsObjectResponse: AxiosResponse<any> = await getDmsObject(context, params, (response: AxiosResponse) => response);

  let url: string;
  if (getDmsObjectResponse.data?._links?.pdfblobcontent) {
    url = getDmsObjectResponse.data._links.pdfblobcontent.href;
  } else {
    throw new NotFoundError("Failed to get dmsObjectPdf", undefined, "No href for pdfblobcontent indicating there is no pdf for this dmsObject.");
  }

  const response: AxiosResponse<ArrayBuffer> = await requestDmsObjectBlob(context, url);
  return transform(response, context, params);
}

export async function requestDmsObjectBlob(context: Context, url: string): Promise<AxiosResponse<ArrayBuffer>> {

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

