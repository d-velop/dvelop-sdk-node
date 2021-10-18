import { HttpConfig, HttpResponse, defaultHttpRequestFunction, ForbiddenError } from "../../utils/http";
import { Context } from "../../utils/context";
import { getDmsObjectFactory } from "../get-dms-object/get-dms-object";


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

/**
 * Default transform-function provided to the {@link deleteCurrentDmsObjectVersion}-function.
 * @category DmsObject
 */
export function deleteCurrentDmsObjectVersionDefaultTransformFunction(response: HttpResponse, _: Context, __: DeleteCurrentDmsObjectVersionParams): boolean {
  if (response.data._links.deleteWithReason || response.data._links.delete) {
    return false;
  } else {
    return true;
  }
}

/**
 * Factory for the {@link deleteCurrentDmsObjectVersion}-function. See internals for more information.
 * @typeparam T Return type of the {@link deleteCurrentDmsObjectVersion}-function. A corresponding transformFuntion has to be supplied.
 * @category DmsObject
 */
export function deleteCurrentDmsObjectVersionFactory<T>(
  httpRequestFunction: (context: Context, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: Context, params: DeleteCurrentDmsObjectVersionParams) => T,
): (context: Context, params: DeleteCurrentDmsObjectVersionParams) => Promise<T> {
  return async (context: Context, params: DeleteCurrentDmsObjectVersionParams) => {

    const getDmsObjectResponse: HttpResponse = await getDmsObjectFactory(httpRequestFunction, (response: HttpResponse) => response)(context, params);

    let url: string;
    if (getDmsObjectResponse.data._links.deleteWithReason) {
      url = getDmsObjectResponse.data._links.deleteWithReason.href;
    } else if (getDmsObjectResponse.data._links.delete) {
      url = getDmsObjectResponse.data._links.delete.href;
    } else {
      throw new ForbiddenError("Deletion denied for user.");
    }

    const response: HttpResponse = await httpRequestFunction(context, {
      method: "DELETE",
      url: url,
      data: {
        reason: params.reason
      }
    });

    return transformFunction(response, context, params);
  };
}

/**
 * Deletes the current (last) version of a DmsObject. The version before that automatically becomes the current version.
 * @returns Boolean value indicating if the dmsObject was completly deleted (aka: You just deleted the first version)
 *
 ```typescript
 *
 * // Delete the whole DmsObject
 * // * Attention: As this method wraps an HTTP-Call this snippet can significantly slow down your code *
 * let deletedAllVersions: boolean = false;
 * while (!deletedAllVersions) {
 *   deletedAllVersions = await deleteCurrentDmsObjectVersionDefaultTransformer(context, {
 *     repositoryId: "",
 *     sourceId: "",
 *     dmsObjectId: "",
 *     reason: ""
 *   });
 * }
 * ```
 *
 * @category DmsObject
 */
/* istanbul ignore next */
export async function deleteCurrentDmsObjectVersion(context: Context, params: DeleteCurrentDmsObjectVersionParams): Promise<boolean> {
  return deleteCurrentDmsObjectVersionFactory(defaultHttpRequestFunction, deleteCurrentDmsObjectVersionDefaultTransformFunction)(context, params);
}
