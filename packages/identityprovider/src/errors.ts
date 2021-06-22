import { AxiosResponse } from "axios";

/**
 * Invalid authSessionId or no authSessionId transferred.
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
 * Valid authSessionId for an external user but external validation was set to false.
 * @category Error
 */
export class ForbiddenError extends Error {
  // eslint-disable-next-line no-unused-vars
  constructor(context: string, public response: AxiosResponse) {
    super(`${context}: Valid authSessionId for an external user but external validation was set to false.`);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}


/**
 * Valid token for a deleted user.
 * @category Error
 */
export class NotFoundError extends Error {
  // eslint-disable-next-line no-unused-vars
  constructor(context: string, public response: AxiosResponse) {
    super(`${context}: Valid authSessionId for a deleted user.`);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}