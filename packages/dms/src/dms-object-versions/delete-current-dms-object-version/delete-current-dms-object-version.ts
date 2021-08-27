import axios, { AxiosResponse } from "axios";
import { TenantContext, getDmsObject, _http } from "../../index";
import { ServiceDeniedError } from "../../utils/errors";


export interface DeleteCurrentDmsObjectVersionParams {
  /** ID of the repository */
  repositoryId: string;
  /** ID of the source */
  sourceId: string;
  /** ID of the DmsObject */
  dmsObjectId: string;
  /** Reason for the deletion */
  reason: string;
}

export type DeleteCurrentDmsObjectVersionTransformer<T> = (response: AxiosResponse<any>, context: TenantContext, params: DeleteCurrentDmsObjectVersionParams)=> T;

export const deleteCurrentDmsObjectVersionDefaultTransformer: DeleteCurrentDmsObjectVersionTransformer<boolean> = function (response: AxiosResponse<any>, _: TenantContext, __: DeleteCurrentDmsObjectVersionParams): boolean {
  if (response.data) {
    return true;
  } else {
    return false;
  }
};

/**
 * Deletes the current (last) version of a DmsObject. The version before that automatically becomes the current version.
 *
 * @param context
 * @param params
 * @returns A boolean value indicating if the dmsObject was completly deleted (aka: You just deleted the first version of it)
 *
 * @throws
 *
 * @example ```typescript
 *
 *
 * // Delete the whole DmsObject
 * // * Attention: As this method wraps an HTTP-Call this snippet can significantly slow down your code *
 * let allDmsObjectVersionsDeleted: boolean = false;
 * while (!allDmsObjectVersionsDeleted) {
 *   allDmsObjectVersionsDeleted = await deleteCurrentDmsObjectVersionDefaultTransformer(context, {
 *     repositoryId: "",
 *     sourceId: "",
 *     dmsObjectId: "",
 *     reason: ""
 *   });
 * }
 * ```
 */
export async function deleteCurrentDmsObjectVersion(context: TenantContext, params: DeleteCurrentDmsObjectVersionParams): Promise<boolean>;
export async function deleteCurrentDmsObjectVersion<T>(context: TenantContext, params: DeleteCurrentDmsObjectVersionParams, transform: DeleteCurrentDmsObjectVersionTransformer<T>): Promise<T>;
export async function deleteCurrentDmsObjectVersion(context: TenantContext, params: DeleteCurrentDmsObjectVersionParams, transform: DeleteCurrentDmsObjectVersionTransformer<any> = deleteCurrentDmsObjectVersionDefaultTransformer): Promise<any> {

  const errorContext: string = "Failed to delete current DmsObjectVersion";
  const getDmsObjectResponse: AxiosResponse<any> = await getDmsObject(context, params, (response) => response);

  let url: string;
  if (getDmsObjectResponse.data?._links?.delete?.href) {
    url = getDmsObjectResponse.data._links.delete.href;
  } else if (getDmsObjectResponse.data?._links?.deleteWithReason?.href) {
    url = getDmsObjectResponse.data._links.deleteWithReason.href;
  } else {
    throw new ServiceDeniedError(errorContext, "No deletion-href found indicating missing permissions.");
  }

  try {
    let response: AxiosResponse<any> = await axios.delete<any>(url, {
      baseURL: context.systemBaseUri,
      headers: {
        "Authorization": `Bearer ${context.authSessionId}`,
        "Accept": "application/hal+json",
        "Content-Type": "application/hal+json"
      },
      data: {
        reason: params.reason
      }
    });

    return transform(response, context, params);
  } catch (e) {
    if (_http.isAxiosError(e)) {
      throw _http.mapAxiosError(errorContext, e);
    } else {
      e.message = `${errorContext}: ${e.message}`;
      throw e;
    }
  }
}

