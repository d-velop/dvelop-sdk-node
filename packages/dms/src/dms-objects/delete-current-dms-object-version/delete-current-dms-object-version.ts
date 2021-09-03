import { AxiosResponse, getAxiosInstance, mapRequestError } from "../../utils/http";
import { Context } from "../../utils/context";
import { ForbiddenError } from "../../utils/errors";
import { getDmsObject } from "../get-dms-object/get-dms-object";


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

export type DeleteCurrentDmsObjectVersionTransformer<T> = (response: AxiosResponse<any>, context: Context, params: DeleteCurrentDmsObjectVersionParams)=> T;

export const deleteCurrentDmsObjectVersionDefaultTransformer: DeleteCurrentDmsObjectVersionTransformer<boolean> = function (response: AxiosResponse<any>, _: Context, __: DeleteCurrentDmsObjectVersionParams): boolean {
  if (response.data?._links?.delete || response.data?._links?.deleteWithReason) {
    return false;
  } else {
    return true;
  }
};

/**
 * Deletes the current (last) version of a DmsObject. The version before that automatically becomes the current version.
 *
 * @param context
 * @param params
 * @returns Boolean value indicating if the dmsObject was completly deleted (aka: You just deleted the first version of it)
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
export async function deleteCurrentDmsObjectVersion(context: Context, params: DeleteCurrentDmsObjectVersionParams): Promise<boolean>;
export async function deleteCurrentDmsObjectVersion<T>(context: Context, params: DeleteCurrentDmsObjectVersionParams, transform: DeleteCurrentDmsObjectVersionTransformer<T>): Promise<T>;
export async function deleteCurrentDmsObjectVersion(context: Context, params: DeleteCurrentDmsObjectVersionParams, transform: DeleteCurrentDmsObjectVersionTransformer<any> = deleteCurrentDmsObjectVersionDefaultTransformer): Promise<any> {

  const errorContext: string = "Failed to delete current DmsObjectVersion";

  const getDmsObjectResponse: AxiosResponse<any> = await getDmsObject(context, params, (response) => response);

  let url: string;
  if (getDmsObjectResponse.data?._links?.delete?.href) {
    url = getDmsObjectResponse.data._links.delete.href;
  } else if (getDmsObjectResponse.data?._links?.deleteWithReason?.href) {
    url = getDmsObjectResponse.data._links.deleteWithReason.href;
  } else {
    throw new ForbiddenError(errorContext, undefined, "Deletion denied for user.");
  }

  let response: AxiosResponse<any>;
  try {
    response = await getAxiosInstance().delete<any>(url, {
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

  } catch (e) {
    throw mapRequestError([], errorContext, e);
  }

  return transform(response, context, params);
}

