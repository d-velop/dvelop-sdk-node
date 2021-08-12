import { AxiosError, AxiosResponse } from "axios";

export interface DmsAppErrorDto {
  reason: string;
  severity: number;
  errorCode: number
  requestId: string;
}

/**
*
* @category Error
*/
export class DmsAppBadRequestError extends Error {
  // eslint-disable-next-line no-unused-vars
  constructor(context: string, public requestError: AxiosError<DmsAppErrorDto>) {
    super(`${context}: ${requestError.response?.data.reason}`);
    Object.setPrototypeOf(this, DmsAppBadRequestError.prototype);
  }
}

/**
 * Invalid authorization.
 * @category Error
 */
export class UnauthorizedError extends Error {
  // eslint-disable-next-line no-unused-vars
  constructor(context: string, public response: AxiosResponse) {
    super(`${context}: Invalid authSessionId or no authSessionId transferred.`);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
*
* @category Error
*/
export class DmsObjectNotFoundError extends Error {
  // eslint-disable-next-line no-unused-vars
  constructor(context: string, public requestError: AxiosError<DmsAppErrorDto>) {
    super(`${context}: ${requestError.response?.data.reason}`);
    Object.setPrototypeOf(this, DmsObjectNotFoundError.prototype);
  }
}

/**
*
* @category Error
*/
export class RepositoryNotFoundError extends Error {
  // eslint-disable-next-line no-unused-vars
  constructor(context: string, public repositoryId: string, public response: AxiosResponse) {
    super(`${context}: Repository with ID: '${repositoryId}' does not exist.`);
    Object.setPrototypeOf(this, RepositoryNotFoundError.prototype);
  }
}

/**
*
* @category Error
*/
export class DmsApiError extends Error {
  // eslint-disable-next-line no-unused-vars
  constructor(context: string, public errorString: string, public response: AxiosResponse) {
    super(`${context}: API-Error: ${errorString}.`);
    Object.setPrototypeOf(this, DmsApiError.prototype);
  }
}
