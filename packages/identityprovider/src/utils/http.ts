
import { DvelopContext, DvelopHttpRequestConfig, DvelopHttpResponse, DvelopHttpClient, defaultDvelopHttpClientFactory, BadInputError, UnauthorizedError, ForbiddenError, NotFoundError, DvelopSdkError } from "@dvelop-sdk/core";
export { DvelopHttpRequestConfig as HttpConfig, DvelopHttpResponse as HttpResponse } from "@dvelop-sdk/core";

/**
* Generic Error for identityprovider-package.
* @category Error
*/
/* istanbul ignore next */
export class IdentityproviderError extends DvelopSdkError {
  // eslint-disable-next-line no-unused-vars
  constructor(public message: string, public originalError?: Error) {
    super(message);
    Object.setPrototypeOf(this, IdentityproviderError.prototype);
  }
}

/**
 * Factory used to create the default httpRequestFunction. Mostly used for HTTP-Error handling.
 * @internal
 * @category Http
 */
export function _defaultHttpRequestFunctionFactory(httpClient: DvelopHttpClient): (context: DvelopContext, config: DvelopHttpRequestConfig) => Promise<DvelopHttpResponse> {
  return async (context: DvelopContext, config: DvelopHttpRequestConfig) => {

    try {
      return await httpClient.request(context, config);
    } catch (error: any) {

      if (error.response) {

        switch (error.response.status) {
        case 400:
          throw new BadInputError(error.response.data?.reason || "Identityprovider-App responded with Status 400 indicating bad Request-Parameters. See 'originalError'-property for details.", error);

        case 401:
          throw new UnauthorizedError(error.response.data?.reason || error.response.data || "Identityprovider-App responded with Status 401 indicating bad authSessionId.", error);

        case 403:
          throw new ForbiddenError(error.response.data?.reason || "Identityprovider-App responded with Status 403 indicating a forbidden action. See 'originalError'-property for details.", error);

        case 404:
          throw new NotFoundError(error.response.data?.reason || error.response.data?.LocalizedMessage || "Identityprovider-App responded with Status 404 indicating a requested resource does not exist. See 'originalError'-property for details.", error);

        default:
          throw new IdentityproviderError(error.response.data?.reason || `Identityprovider-App responded with status ${error.response.status}. See 'originalError'-property for details.`, error);
        }
      } else {
        throw new IdentityproviderError(`Request to Identityprovider-App failed: ${error.message}. See 'originalError'-property for details.`, error);
      }
    }
  };
}

/**
 * Default httpRequestFunction used in dms-package.
 * @internal
 * @category Http
 */
/* istanbul ignore next */
export async function _defaultHttpRequestFunction(context: DvelopContext, config: DvelopHttpRequestConfig): Promise<DvelopHttpResponse> {
  return _defaultHttpRequestFunctionFactory(defaultDvelopHttpClientFactory())(context, config);
}