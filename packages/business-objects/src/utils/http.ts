
import { DvelopContext, DvelopHttpRequestConfig, DvelopHttpResponse, DvelopHttpClient, defaultDvelopHttpClientFactory, BadInputError, UnauthorizedError, ForbiddenError, NotFoundError, DvelopSdkError } from "@dvelop-sdk/core";
export { DvelopHttpRequestConfig as HttpConfig, DvelopHttpResponse as HttpResponse } from "@dvelop-sdk/core";

/**
 * ErrorDto for BusinessObjects-App.
 * @category Error
 */
export interface BusinessObjectsErrorDto {
  error: {
    /* Service-defined error code - see [BusinessObjects-Error Codes](https://dv-businessobjects-assets.s3.eu-central-1.amazonaws.com/documentation/latest/business_objects_api.html#error-codes) for more information */
    code: string;
    /* A human-readable representation of the error. */
    message: string;
    /* A collection of error details. */
    details: {
      /* An error detail code defined by the service. */
      code: string;
      /* A human-readable representation of the error detail. */
      message: string;
    }[];
    /* Debugging information to help determine the error cause. */
    innerError: {
      /* The timestamp as the error occurred. */
      timestamp: string;
      /* 	A randomly generated identifier that uniquely distinguishes each request and that can be used for correlation purposes. */
      requestId: string;
    }
  }
}

function getErrorString(error: BusinessObjectsErrorDto): string | null {


  if (error?.error) {

    let detailString: string = "";

    if (error.error.details && error.error.details.length > 0) {
      detailString = error.error.details
        .reduce((detailString, detail) => detailString += `\t * ${detail.message} (${detail.code})\n`, "\n");
    }

    return `${error.error.message} (${error.error.code}).${detailString}\nSee 'See 'originalError'-property for details.'`;
  } else {
    return null;
  }
}

/**
* Generic Error for business-objects package.
* @category Error
*/
/* istanbul ignore next */
export class BusinessObjectsError extends DvelopSdkError {
  // eslint-disable-next-line no-unused-vars
  constructor(public message: string, public originalError?: Error) {
    super(message);
    Object.setPrototypeOf(this, BusinessObjectsError.prototype);
  }
}

/**
* TODO: Generic Error for business-objects package.
* @category Error
*/
/* istanbul ignore next */
export class NotImplementedError extends DvelopSdkError {
  // eslint-disable-next-line no-unused-vars
  constructor(public message: string, public originalError?: Error) {
    super(message);
    Object.setPrototypeOf(this, NotImplementedError.prototype);
  }
}

/**
 * Factory used to create the default httpRequestFunction. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
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
        case 409: // Conflict
        case 413: // Request Entity Too Large
        case 414: // URI Too Long
        case 429: // Too Many Requests
        case 431: // Request Header Fields Too Large
          throw new BadInputError(getErrorString(error.response.data) || "BusinessObjects-App responded with Status 400 indicating bad Request-Parameters. See 'originalError'-property for details.", error);

        case 401:
          throw new UnauthorizedError(getErrorString(error.response.data) || error.response.data || "BusinessObjects-App responded with Status 401 indicating bad authSessionId.", error);

        case 403:
          throw new ForbiddenError(getErrorString(error.response.data) || "BusinessObjects-App responded with Status 403 indicating a forbidden action. See 'originalError'-property for details.", error);

        case 404:
          throw new NotFoundError(getErrorString(error.response.data) || "BusinessObjects-App responded with Status 404 indicating a requested resource does not exist. See 'originalError'-property for details.", error);

        case 501:
          throw new NotImplementedError(getErrorString(error.response.data) || "BusinessObjects-App responded with Status 501 indicating a requested feature is not implemented. See 'originalError'-property for details.", error);

        default:
          throw new BusinessObjectsError(getErrorString(error.response.data) || `BusinessObjects-App responded with status ${error.response.status}. See 'originalError'-property for details.`, error);
        }
      } else {
        throw new BusinessObjectsError(`Request to BusinessObjects-App failed: ${error.message}. See 'originalError'-property for details.`, error);
      }
    }
  };
}


/**
 * Default httpRequestFunction used in dms-package. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category Http
 */
/* istanbul ignore next */
export async function _defaultHttpRequestFunction(context: DvelopContext, config: DvelopHttpRequestConfig): Promise<DvelopHttpResponse> {
  return _defaultHttpRequestFunctionFactory(defaultDvelopHttpClientFactory())(context, config);
}