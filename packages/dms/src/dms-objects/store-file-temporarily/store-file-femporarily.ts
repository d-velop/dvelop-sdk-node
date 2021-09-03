import { AxiosResponse } from "axios";
import { getAxiosInstance, mapRequestError } from "../../utils/http";
import { Context } from "../../utils/context";

export interface StoreFileTemporarilyParams {
  repositoryId: string;
  file: ArrayBuffer;
}

export type StoreFileTemporarilyTransformer<T> = (response: AxiosResponse<void>, context: Context, params: StoreFileTemporarilyParams)=> T;

export function storeFileTemporarilyDefaultTransform(response: AxiosResponse<void>, _: Context, __: StoreFileTemporarilyParams): string {
  return response.headers["location"];
}

export async function storeFileTemporarily(context: Context, params: StoreFileTemporarilyParams): Promise<string>;
export async function storeFileTemporarily<T>(context: Context, params: StoreFileTemporarilyParams, transform: StoreFileTemporarilyTransformer<T>): Promise<T>;
export async function storeFileTemporarily(context: Context, params: StoreFileTemporarilyParams, transform: StoreFileTemporarilyTransformer<any> = storeFileTemporarilyDefaultTransform): Promise<any> {

  let response: AxiosResponse<void>;
  try {
    response = await getAxiosInstance().post<void>("/dms", params.file, {
      baseURL: context.systemBaseUri,
      headers: {
        "Authorization": `Bearer ${context.authSessionId}`,
        "Content-Type": "application/octet-stream"
      },
      follows: ["repo", "chunkedupload"],
      templates: {
        "repositoryid": params.repositoryId
      }
    });
  } catch (e) {
    throw mapRequestError([400], "Failed to store file temporarily", e);
  }

  return transform(response, context, params);
}