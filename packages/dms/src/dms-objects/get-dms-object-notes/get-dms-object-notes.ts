import { DvelopContext, DvelopOptions, dvelopFetch } from "@dvelop-sdk/core";
import { ensureSuccessResponse } from "../../utils/dms-error";

/**
 * Parameters for the {@link getDmsObjectNotes}-function.
 * @category DmsObject
 */
export interface GetDmsObjectNotesParams {
  /** ID of the repository */
  repositoryId: string;
  /** ID of the DmsObject */
  dmsObjectId: string;
}

/**
 * All information provided for a single note for the {@link DmsObjectNotes}-interface.
 * @category DmsObject
 */
export interface DmsObjectNote {
  /* Creator of the DmsObjectNotes */
  creator: {
    /* ID of the creator of the note */
    id: string;
    /* DisplayName is the full name of the creator */
    displayName: string;
  },
  /* Text of the note */
  text: string;
  /* Creation date of the note */
  created: Date;
}

/**
 * Default transform-function provided to the {@link getDmsObjectNotes}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category DmsObject
 */
export async function onResponse(response: Response): Promise<DmsObjectNote[]> {
  await ensureSuccessResponse(response);
  const data: any = await response.json();
  return data.notes.map((note: any) => ({
    creator: {
      id: note.creator.id,
      displayName: note.creator.displayName
    },
    text: note.text,
    created: new Date(note.created)
  }));
}

/**
 * Get all notes for an existing DmsObject.
 *
 * ```typescript
 * import { getDmsObjectNotes } from "@dvelop-sdk/dms";
 *
 * const notes: DmsObjectNote[] = getDmsObjectNotes({
 *   systemBaseUri: "https://steamwheedle-cartel.d-velop.cloud",
 *   authSessionId: "dQw4w9WgXcQ"
 * }, {
 *   repositoryId: "qnydFmqHuVo",
 *   dmsObjectId: "GDYQ3PJKrT8"
 * });
 *
 * notes.forEach(n => {
 *   console.log(`${n.creator.displayName}: "${n.text}"`);
 * });
 * ```
 *
 * @category DmsObject
 */
export async function getDmsObjectNotes(context: DvelopContext, params: GetDmsObjectNotesParams): Promise<DmsObjectNote[]>;
export async function getDmsObjectNotes<T>(context: DvelopContext, params: GetDmsObjectNotesParams, options: DvelopOptions<T>): Promise<T>;
export async function getDmsObjectNotes<T>(
  context: DvelopContext,
  params: GetDmsObjectNotesParams,
  options: DvelopOptions<T | DmsObjectNote[]> = {
    onResponse: onResponse
  }
): Promise<T | DmsObjectNote[]> {
  return dvelopFetch(context, `/dms/r/${params.repositoryId}/o2m/${params.dmsObjectId}/n`, { method: "GET" }, options);
}
