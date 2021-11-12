import { DvelopContext } from "../../../../core/lib";
import { HttpConfig, HttpResponse, _defaultHttpRequestFunction } from "../../utils/http";

export interface RequestAppSessionParams {
  appName: string;
  callback: string;
}

/**
 * Factory for the {@link requestAppSession}-function. See internals for more information.
 * @typeparam T Return type of the {@link requestAppSession}-function. A corresponding transformFuntion has to be supplied.
 * @category DmsObject
 */
export function _requestAppSessionFactory<T>(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: DvelopContext, params: RequestAppSessionParams) => T,
): (context: DvelopContext, params: RequestAppSessionParams) => Promise<T> {

  return async (context: DvelopContext, params: RequestAppSessionParams) => {

    const response = await httpRequestFunction(context, {
      method: "POST",
      url: "/identityprovider/appsession",
      data: {
        appname: params.appName,
        callback: params.callback,
        requestid: context.requestId
      }
    });

    return transformFunction(response, context, params);
  };
}

/**
 * Request an AppSessionId a DmsObject.
 *
 * ```typescript
 * //TODO
 * ```
 * @category DmsObject
 */
/* istanbul ignore next */
export async function requestAppSession(context: DvelopContext, params: RequestAppSessionParams): Promise<void> {
  return await _requestAppSessionFactory(_defaultHttpRequestFunction, () => { })(context, params);
}