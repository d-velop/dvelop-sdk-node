import { AxiosResponse } from "axios";

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
export class RepositoryNotFoundError extends Error {
  // eslint-disable-next-line no-unused-vars
  constructor(context: string, public repositoryId: string, public response: AxiosResponse) {
    super(`${context}: Repository with ID: '${repositoryId}' does not exist.`);
    Object.setPrototypeOf(this, RepositoryNotFoundError.prototype);
  }
}