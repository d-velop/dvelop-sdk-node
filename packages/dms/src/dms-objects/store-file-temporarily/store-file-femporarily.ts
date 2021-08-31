import { AxiosResponse } from "axios";
import { getAxiosInstance, isAxiosError, mapAxiosError } from "../../utils/http";
import { TenantContext } from "../../utils/tenant-context";

export interface StoreFileTemporarilyParams {
  repositoryId: string;
  file: ArrayBuffer;
}

export type StoreFileTemporarilyTransformer<T> = (response: AxiosResponse<void>, context: TenantContext, params: StoreFileTemporarilyParams)=> T;

export function storeFileTemporarilyDefaultTransform(response: AxiosResponse<void>, _: TenantContext, __: StoreFileTemporarilyParams): string {
  return response.headers["location"];
}

export async function storeFileTemporarily(context: TenantContext, params: StoreFileTemporarilyParams): Promise<string>;
export async function storeFileTemporarily<T>(context: TenantContext, params: StoreFileTemporarilyParams, transform: StoreFileTemporarilyTransformer<T>): Promise<T>;
export async function storeFileTemporarily(context: TenantContext, params: StoreFileTemporarilyParams, transform: StoreFileTemporarilyTransformer<any> = storeFileTemporarilyDefaultTransform): Promise<any> {

  try {
    const response: AxiosResponse<void> = await getAxiosInstance().post<void>("/dms", params.file, {
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

    return transform(response, context, params);
  } catch(e) {
    const errorContext = "Failed to store file temporarily";
    if (isAxiosError(e)) {
      throw mapAxiosError(errorContext, e);
    } else {
      e.message = `${errorContext}: ${e.message}`;
      throw e;
    }
  }
}