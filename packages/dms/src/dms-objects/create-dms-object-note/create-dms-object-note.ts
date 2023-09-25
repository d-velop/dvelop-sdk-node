import { _defaultHttpRequestFunction, HttpConfig, HttpResponse } from "../../utils/http";
import { DvelopContext } from "../../index";

/**
 * Parameters for the {@link createDmsObjectNote}-function.
 * @category DmsObject
 */
export interface CreateDmsObjectNoteParams {
  /** ID of the repository */
  repositoryId: string;

  /** ID of the DmsObject */
  dmsObjectId: string;

  /** Text for the note */
  noteText: string;
}

/**
 * Default transform-function provided to the {@link createDmsObjectNote}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category DmsObject
 */
export function _createDmsObjectNoteDefaultTransformFunction(_: HttpResponse<any>, __: DvelopContext, ___: CreateDmsObjectNoteParams): void { } // no error indicates sucess

/**
 * Factory for the {@link createDmsObjectNote}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @typeparam T Return type of the {@link createDmsObjectNote}-function. A corresponding transformFunction has to be supplied.
 * @category DmsObject
 */
export function _createDmsObjectNoteFactory<T>(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: DvelopContext, params: CreateDmsObjectNoteParams) => T
): (context: DvelopContext, params: CreateDmsObjectNoteParams) => Promise<T> {
  return async (context: DvelopContext, params: CreateDmsObjectNoteParams) => {
    const response: HttpResponse = await httpRequestFunction(context, {
      method: "POST",
      url: "/dms",
      follows: ["repo", "dmsobjectwithmapping", "notes"],
      templates: {
        "repositoryid": params.repositoryId,
        "dmsobjectid": params.dmsObjectId
      },
      data: {
        "text": params.noteText
      }
    });

    return transformFunction(response, context, params);
  };
}

/**
 * Create a note for an existing DmsObject.
 *
 * ```typescript
 * import { createDmsObjectNote } from "@dvelop-sdk/dms";
 *
 * await createDmsObjectNote({
 *   systemBaseUri: "https://steamwheedle-cartel.d-velop.cloud",
 *   authSessionId: "dQw4w9WgXcQ"
 * }, {
 *   repositoryId: "qnydFmqHuVo",
 *   dmsObjectId: "GDYQ3PJKrT8",
 *   noteText: "This document is of importance for the Venture Trading Company!"
 * });
 * ```
 *
 * @category DmsObject
 */
/* istanbul ignore next */
export async function createDmsObjectNote(context: DvelopContext, params: CreateDmsObjectNoteParams): Promise<void> {
  return await _createDmsObjectNoteFactory(_defaultHttpRequestFunction, _createDmsObjectNoteDefaultTransformFunction)(context, params);
}
