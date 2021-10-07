import { HttpConfig, HttpResponse, defaultHttpRequestFunction } from "../../utils/http";
import { Context } from "../../utils/context";

export interface StoreFileTemporarilyParams {
  /** Id of the repository */
  repositoryId: string;
  /** File-binary as ArrayBuffer */
  content: ArrayBuffer;
}

/**
 * Default transform-function provided to the {@link storeFileTemporarily}-function.
 * @category DmsObject
 */
export function storeFileTemporarilyDefaultTransformFunction(response: HttpResponse, _: Context, __: StoreFileTemporarilyParams): string {
  return response.headers["location"];
}

/**
 * Factory for the {@link storeFileTemporarily}-function. See internals for more information.
 * @typeparam T Return type of the {@link storeFileTemporarily}-function. A corresponding transformFuntion has to be supplied.
 * @category DmsObject
 */
export function storeFileTemporarilyFactory<T>(httpRequestFunction: (context: Context, config: HttpConfig)=> Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: Context, params: StoreFileTemporarilyParams)=> T) {
  return async (context: Context, params: StoreFileTemporarilyParams) => {
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
 * import { readFileSync } from "fs"; // Node.js
 *
 * const file: ArrayBuffer = readFileSync(`${__dirname}/our-profits.kaching`).buffer; // Node.js
 *
 * const temporaryUri: string = await storeFileTemporarily({
 *   systemBaseUri: "https://steamwheedle-cartel.d-velop.cloud",
 *   authSessionId: "dQw4w9WgXcQ"
 * }, {
 *  repositoryId: "169",
    content: file
 * });
 * console.log(temporaryUri); // /dms/some-random-blob-url
 * ```
 *
 * @category DmsObject
 */
/* istanbul ignore next */
export async function storeFileTemporarily(context: Context, params: StoreFileTemporarilyParams): Promise<string> {
  return storeFileTemporarilyFactory(defaultHttpRequestFunction, storeFileTemporarilyDefaultTransformFunction)(context, params);
}