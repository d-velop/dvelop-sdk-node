import { DvelopContext, DvelopOptions, dvelopFetch } from "@dvelop-sdk/core";
import { ensureSuccessResponse } from "../../utils/dms-error";

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
export async function onResponse(response: Response): Promise<void> {
  await ensureSuccessResponse(response);
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
export async function createDmsObjectNote(context: DvelopContext, params: CreateDmsObjectNoteParams): Promise<void>;
export async function createDmsObjectNote<T>(context: DvelopContext, params: CreateDmsObjectNoteParams, options: DvelopOptions<T>): Promise<T>;
export async function createDmsObjectNote<T>(
  context: DvelopContext,
  params: CreateDmsObjectNoteParams,
  options: DvelopOptions<T | void> = {
    onResponse: onResponse
  }
): Promise<T | void> {
  return dvelopFetch(context, `/dms/r/${params.repositoryId}/o2m/${params.dmsObjectId}/n`, {
    method: "POST",
    body: JSON.stringify({ text: params.noteText })
  }, options);
}
