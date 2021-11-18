import { DvelopContext } from "../../index";
import { HttpConfig, HttpResponse, _defaultHttpRequestFunction } from "../../utils/http";

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
export function _storeFileTemporarilyDefaultTransformFunction(response: HttpResponse, _: DvelopContext, __: StoreFileTemporarilyParams): string {
  return response.headers["location"];
}

/**
 * Factory for the {@link storeFileFunction}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @typeparam T Return type of the {@link storeFileFunction}-function. A corresponding transformFuntion has to be supplied.
 * @internal
 * @category DmsObject
 */
export function _storeFileTemporarilyFactory<T>(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: DvelopContext, params: StoreFileTemporarilyParams) => T
): (context: DvelopContext, params: StoreFileTemporarilyParams) => Promise<T> {
  return async (context: DvelopContext, params: StoreFileTemporarilyParams) => {
    const response: HttpResponse = await httpRequestFunction(context, {
      method: "POST",
      url: "/dms",
      follows: ["repo", "chunkedupload"],
      templates: { "repositoryid": params.repositoryId },
      headers: { "Content-Type": "application/octet-stream" },
      data: params.content
    });
    return transformFunction(response, context, params);
  };
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
/* istanbul ignore next */
export async function storeFileTemporarily(context: DvelopContext, params: StoreFileTemporarilyParams): Promise<string> {
  return _storeFileTemporarilyFactory(_defaultHttpRequestFunction, _storeFileTemporarilyDefaultTransformFunction)(context, params);
}