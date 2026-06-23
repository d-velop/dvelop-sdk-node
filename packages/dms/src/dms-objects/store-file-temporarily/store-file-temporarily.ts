import { DvelopContext, DvelopOptions, dvelopFetch } from "@dvelop-sdk/core";
import { ensureSuccessResponse } from "../../utils/dms-error";

/**
 * Parameters for the {@link storeFileTemporarily}-function.
 * @category DmsObject
 */
export interface StoreFileTemporarilyParams {
  /** Id of the repository */
  repositoryId: string;
  /** File-binary as ArrayBuffer */
  content: ArrayBuffer;
}

/**
 * Default transform-function provided to the {@link storeFileTemporarily}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category DmsObject
 */
export async function onResponse(response: Response): Promise<string> {
  await ensureSuccessResponse(response);
  return response.headers.get("location") ?? "";
}

/**
 * Returns an URI under which a file is temporarily available for download.
 *
 * ```typescript
 * import { storeFileTemporarily } from "@dvelop-sdk/dms";
 * import { readFileSync } from "fs";
 *
 * //only node.js
 * const file: ArrayBuffer = readFileSync(`${ __dirname }/our-profits.kaching`).buffer;
 *
 * const temporaryUri: string = await storeFileTemporarily({
 *   systemBaseUri: "https://steamwheedle-cartel.d-velop.cloud",
 *   authSessionId: "dQw4w9WgXcQ"
 * }, {
 *   repositoryId: "qnydFmqHuVo",
 *   content: file
 * });
 *
 * console.log(temporaryUri); // /dms/some-random-blob-url
 * ```
 *
 * @category DmsObject
 */
export async function storeFileTemporarily(context: DvelopContext, params: StoreFileTemporarilyParams): Promise<string>;
export async function storeFileTemporarily<T>(context: DvelopContext, params: StoreFileTemporarilyParams, options: DvelopOptions<T>): Promise<T>;
export async function storeFileTemporarily<T>(
  context: DvelopContext,
  params: StoreFileTemporarilyParams,
  options: DvelopOptions<T | string> = {
    onResponse: onResponse
  }
): Promise<T | string> {
  return dvelopFetch(context, `/dms/r/${params.repositoryId}/blob/chunk`, {
    method: "POST",
    headers: { "Content-Type": "application/octet-stream" },
    body: params.content
  }, options);
}
