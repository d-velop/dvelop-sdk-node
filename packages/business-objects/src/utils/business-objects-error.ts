import { BadInputError, DvelopSdkError, ForbiddenError, NotFoundError, UnauthorizedError } from "@dvelop-sdk/core";

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
    details?: {
      /* An error detail code defined by the service. */
      code: string;
      /* A human-readable representation of the error detail. */
      message: string;
    }[];
    /* Debugging information to help determine the error cause. */
    innerError?: {
      /* The timestamp as the error occurred. */
      timestamp: string;
      /* A randomly generated identifier that uniquely distinguishes each request and that can be used for correlation purposes. */
      requestId: string;
    }
  }
}

/**
 * Generic Error for business-objects package.
 * @category Error
 */
/* istanbul ignore next */
export class BusinessObjectsError extends DvelopSdkError {

  constructor(public message: string, public originalError?: Error) {
    super(message);
    Object.setPrototypeOf(this, BusinessObjectsError.prototype);
  }
}

/**
 * Indicates that a requested feature is not implemented by the BusinessObjects-App.
 * @category Error
 */
/* istanbul ignore next */
export class NotImplementedError extends DvelopSdkError {

  constructor(public message: string, public originalError?: Error) {
    super(message);
    Object.setPrototypeOf(this, NotImplementedError.prototype);
  }
}

/**
 * Builds a human-readable message from a {@link BusinessObjectsErrorDto}.
 * @internal
 * @category Error
 */
export function getErrorString(error: BusinessObjectsErrorDto): string | null {

  if (error?.error) {

    let detailString: string = "";

    if (error.error.details && error.error.details.length > 0) {
      detailString = error.error.details
        .reduce((detailString, detail) => detailString += `\t * ${detail.message} (${detail.code})\n`, "\n");
    }

    return `${error.error.message} (${error.error.code}).${detailString}`;
  } else {
    return null;
  }
}

/**
 * Throws a typed error if the response indicates failure.
 * @internal
 * @category Http
 */
export async function ensureSuccessResponse(response: Response): Promise<void> {

  if (response.ok) return;

  let body: any;
  try {
    body = await response.clone().json();
  } catch {
    try {
      body = await response.clone().text();
    } catch {
      body = undefined;
    }
  }

  const errorString: string | null = (body && typeof body === "object") ? getErrorString(body) : null;
  const bodyString: string | null = typeof body === "string" && body.length > 0 ? body : null;

  switch (response.status) {
  case 400:
  case 409: // Conflict
  case 413: // Request Entity Too Large
  case 414: // URI Too Long
  case 429: // Too Many Requests
  case 431: // Request Header Fields Too Large
    throw new BadInputError(errorString ?? "BusinessObjects-App responded with Status 400 indicating bad Request-Parameters.");
  case 401:
    throw new UnauthorizedError(errorString ?? bodyString ?? "BusinessObjects-App responded with Status 401 indicating bad authSessionId.");
  case 403:
    throw new ForbiddenError(errorString ?? "BusinessObjects-App responded with Status 403 indicating a forbidden action.");
  case 404:
    throw new NotFoundError(errorString ?? "BusinessObjects-App responded with Status 404 indicating a requested resource does not exist.");
  case 501:
    throw new NotImplementedError(errorString ?? "BusinessObjects-App responded with Status 501 indicating a requested feature is not implemented.");
  default:
    throw new BusinessObjectsError(errorString ?? `BusinessObjects-App responded with status ${response.status}.`);
  }
}
