import { DvelopContext } from "../../index";
import { HttpConfig, HttpResponse, _defaultHttpRequestFunction } from "../../utils/http";

export type DmsObjectStatus = "Processing" | "Verification" | "Release";

/**
 * Parameters for the {@link updateDmsObjectStatus}-function.
 * @category DmsObject
 */
export interface UpdateDmsObjectStatusParams {
  /** ID of the repository */
  repositoryId: string;
  /** ID of the DmsObject */
  dmsObjectId: string;
  /** State of the dms Object */
  status: DmsObjectStatus;
  /** User or Group to which the DmsObject will be assigned. You can specify individual users as well as groups using IDs of the Identityprovider-App */
  editor?: string;
  /** Description of changes */
  alterationText?: string;
}

/**
 * Default transform-function provided to the {@link updateDmsObjectStatus}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category DmsObject
 */
export function _updateDmsObjectStatusDefaultTransformFunction(_: HttpResponse, __: DvelopContext, ___: UpdateDmsObjectStatusParams): void { } // no error indicates success. Returning void

/**
 * Factory for the {@link updateDmsObject}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @typeparam T Return type of the {@link updateDmsObjectStatus}-function. A corresponding transformFunction has to be supplied.
 * @internal
 * @category DmsObject
 */
export function _updateDmsObjectStatusFactory<T>(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: DvelopContext, params: UpdateDmsObjectStatusParams) => T,
): (context: DvelopContext, params: UpdateDmsObjectStatusParams) => Promise<T> {
  return async (context: DvelopContext, params: UpdateDmsObjectStatusParams) => {

    const properties: { key: string, values: string[] }[] = [{
      key: "property_state",
      values: [params.status]
    }]

    if (params.editor) {
      properties.push({
        key: "property_editor",
        values: [params.editor]
      })
    }

    const response: HttpResponse = await httpRequestFunction(context, {
      method: "PUT",
      url: "/dms",
      follows: ["repo", "dmsobjectwithmapping", "displayVersion"],
      templates: {
        "repositoryid": params.repositoryId,
        "dmsobjectid": params.dmsObjectId
      },
      data: {
        "sourceId": `/dms/r/${params.repositoryId}/source`,
        "alterationText": params.alterationText || undefined,
        "sourceProperties": {
          "properties": properties
        }
      }
    });
    return transformFunction(response, context, params);
  };
}

/**
 * Update a DmsObject.
 *
 * ```typescript
 * import { updateDmsObjectStatus } from "@dvelop-sdk/dms";
 *
 * await updateDmsObjectStatus({
 *   systemBaseUri: "https://steamwheedle-cartel.d-velop.cloud",
 *   authSessionId: "dQw4w9WgXcQ"
 * }, {
 *   repositoryId: "qnydFmqHuVo",
 *   dmsObjectId: "GDYQ3PJKrT8",
 *   alterationText: "Updated by SDK",
 *   status: "Processing",
 *   editor: "NQlcUY5zDUk"
 * });
 * ```
 *
 * @category DmsObject
 */
/* istanbul ignore next */
export function updateDmsObjectStatus(context: DvelopContext, params: UpdateDmsObjectStatusParams): Promise<void> {
  return _updateDmsObjectStatusFactory<void>(_defaultHttpRequestFunction, _updateDmsObjectStatusDefaultTransformFunction)(context, params);
}