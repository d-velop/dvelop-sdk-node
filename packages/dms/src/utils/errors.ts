import { isAxiosError } from "./http";

export interface DmsAppErrorDto {
  reason?: string;
  severity?: number;
  errorCode?: number
  requestId?: string;
}

function formatErrorMessage(context: string, originalError?: Error, message?: string) {
  if (message) {
    return `${context}: ${message}`;
  } else if (originalError) {
    if (isAxiosError(originalError) && originalError?.response?.data?.reason) {
      return `${context}: ${originalError.response.data.reason}`;
    } else {
      return `${context}: ${originalError.message}`;
    }
  } else {
    return context;
  }
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
 * Invalid authorization.
 * @category Error
 */
export class UnauthorizedError extends DmsError {
  // eslint-disable-next-line no-unused-vars
  constructor(context: string, originalError?: Error, message?: string) {
    super(context, originalError, message);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}
/**
*
* @category Error
*/
export class ForbiddenError extends DmsError {
  // eslint-disable-next-line no-unused-vars
  constructor(context: string, originalError?: Error, message?: string) {
    super(context, originalError, message);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
* Indicates that a resource was not found.
* @category Error
*/
export class NotFoundError extends DmsError {
  // eslint-disable-next-line no-unused-vars
  constructor(context: string, originalError?: Error, message?: string) {
    super(context, originalError, message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
