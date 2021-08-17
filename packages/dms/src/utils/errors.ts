import { AxiosError } from "axios";

export interface DmsAppErrorDto {
  reason: string;
  severity: number;
  errorCode: number
  requestId: string;
}

/**
* Indicates invalid method params. See ```e.requestError.response.data.reasone```-property for further infomation.
* @category Error
*/
export class BadRequestError extends Error {
  // eslint-disable-next-line no-unused-vars
  constructor(context: string, public requestError: AxiosError<DmsAppErrorDto>) {
    super(`${context}: ${requestError.response?.data.reason}`);
    Object.setPrototypeOf(this, BadRequestError.prototype);
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
  constructor(context: string, public requestError: AxiosError<DmsAppErrorDto>) {
    super(`${context}: ${requestError.response?.data}`);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
