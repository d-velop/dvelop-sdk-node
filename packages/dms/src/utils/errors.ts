import { AxiosError } from "axios";
import { isAxiosError } from "./http";

function formatErrorMessage(context: string, originalError?: Error, message?: string) {
  if (message) {
    return `${context}: ${message}`;
  } else if (isAxiosError(originalError) && originalError?.response?.data?.reason) {
    return `${context}: ${originalError.response.data.reason}`;
  } else if (originalError) {
    return `${context}: ${originalError.message}`;
  } else {
    return context;
  }
}

export interface DmsAppErrorDto {
  reason: string;
  severity: number;
  errorCode: number
  requestId: string;
}

/**
* General Error.
* @category Error
*/
export class DmsError extends Error {
  // eslint-disable-next-line no-unused-vars
  constructor(context: string, public originalError?: Error, message?: string) {
    super(formatErrorMessage(context, originalError, message));
    Object.setPrototypeOf(this, DmsError.prototype);
  }

  isAxiosError(): boolean {
    return isAxiosError(this.originalError);
  }
}

/**
* Indicates invalid method params. See ```e.requestError.response.data.reasone```-property for further infomation.
* @category Error
*/
export class BadRequestError extends Error {
  // eslint-disable-next-line no-unused-vars
  constructor(context: string, public requestError: AxiosError<DmsAppErrorDto>) {
    super(`${context}: ${requestError.response?.data?.reason}`);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

/**
*
* @category Error
*/
export class BadInputError extends DmsError {
  // eslint-disable-next-line no-unused-vars
  constructor(context: string, originalError?: Error, message?: string) {
    super(context, originalError, message);
    Object.setPrototypeOf(this, BadInputError.prototype);
  }
}

/**
*
* @category Error
*/
export class ForbiddenError extends DmsError {
  // eslint-disable-next-line no-unused-vars
  constructor(context: string, public originalError?: AxiosError<DmsAppErrorDto>, message?: string) {
    super(context, originalError, message);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * Invalid authorization.
 * @category Error
 */
export class UnauthorizedError extends Error {
  // eslint-disable-next-line no-unused-vars
  constructor(context: string, public requestError: AxiosError<DmsAppErrorDto>) {
    super(`${context}: Invalid authorization.`);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}



/**
* Indicates that a resource was not found.
* @category Error
*/
export class NotFoundError extends Error {
  // eslint-disable-next-line no-unused-vars
  constructor(context: string, errorMessage: string, public requestError?: AxiosError<DmsAppErrorDto>) {
    super(`${context}: ${errorMessage}`);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
* Indicates that a request was denied. This could have multiple reasons.
* Make sure the user has sufficient permissions and no other user is blocking the request.
* @category Error
*/
export class ServiceDeniedError extends Error {
  // eslint-disable-next-line no-unused-vars
  constructor(context: string, message: string) {
    super(`${context}: ${message}`);
    Object.setPrototypeOf(this, ServiceDeniedError.prototype);
  }
}
