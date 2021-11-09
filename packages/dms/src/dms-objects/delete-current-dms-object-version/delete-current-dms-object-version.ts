import { DvelopContext, ForbiddenError } from "../../index";
import { HttpConfig, HttpResponse, _defaultHttpRequestFunction } from "../../utils/http";
import { _getDmsObjectFactory } from "../get-dms-object/get-dms-object";

/**
 * Parameters for the {@link deleteCurrentDmsObjectVersion}-function.
 * @category DmsObject
 */
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
 * @internal
 * @category DmsObject
 */
export function _deleteCurrentDmsObjectVersionDefaultTransformFunction(response: HttpResponse, _: DvelopContext, __: DeleteCurrentDmsObjectVersionParams): boolean {
  if (response.data._links.deleteWithReason || response.data._links.delete) {
    return false;
  } else {
    return true;
  }
}

/**
 * Factory for the {@link deleteCurrentDmsObjectVersion}-function. See internals for more information.
 * @typeparam T Return type of the {@link deleteCurrentDmsObjectVersion}-function. A corresponding transformFuntion has to be supplied.
 * @internal
 * @category DmsObject
 */
export function _deleteCurrentDmsObjectVersionFactory<T>(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: DvelopContext, params: DeleteCurrentDmsObjectVersionParams) => T,
): (context: DvelopContext, params: DeleteCurrentDmsObjectVersionParams) => Promise<T> {
  return async (context: DvelopContext, params: DeleteCurrentDmsObjectVersionParams) => {

    const getDmsObjectResponse: HttpResponse = await _getDmsObjectFactory(httpRequestFunction, (response: HttpResponse) => response)(context, params);

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
 * ```typescript
 * import { deleteCurrentDmsObjectVersion } from "@dvelop-sdk/dms";
 *
 * await deleteCurrentDmsObjectVersion({
 *   systemBaseUri: "https://steamwheedle-cartel.d-velop.cloud",
 *   authSessionId: "dQw4w9WgXcQ"
 * }, {
 *     repositoryId: "qnydFmqHuVo",
 *     sourceId: "/dms/r/qnydFmqHuVo/source",
 *     dmsObjectId: "GDYQ3PJKrT8",
 *     reason: "This shall be gone! Tout de suite!"
 *   });
 *
 * // Delete the whole DmsObject
 * // * Attention: This method wraps a HTTP-Call in a loop and can significantly slow down your code *
 * let deletedAllVersions: boolean = false;
 * while (!deletedAllVersions) {
 *   deletedAllVersions = await deleteCurrentDmsObjectVersion({
 *     systemBaseUri: "https://steamwheedle-cartel.d-velop.cloud",
 *     authSessionId: "dQw4w9WgXcQ"
 *   }, {
 *     repositoryId: "qnydFmqHuVo",
 *     sourceId: "/dms/r/qnydFmqHuVo/source",
 *     dmsObjectId: "GDYQ3PJKrT8",
 *     reason: "This shall be gone! Tout de suite!"
 *   });
 * }
 * ```
 *
 * @category DmsObject
 */
/* istanbul ignore next */
export async function deleteCurrentDmsObjectVersion(context: DvelopContext, params: DeleteCurrentDmsObjectVersionParams): Promise<boolean> {
  return _deleteCurrentDmsObjectVersionFactory(_defaultHttpRequestFunction, _deleteCurrentDmsObjectVersionDefaultTransformFunction)(context, params);
}
