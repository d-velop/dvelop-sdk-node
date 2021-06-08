import { AxiosResponse } from "axios";

/**
 *
 * @category Error
 */
export class UnauthenticatedUserError extends Error {
// eslint-disable-next-line no-unused-vars
  constructor(context: string, public response: AxiosResponse) {
    super(`${context}: Unauthenticated User.`);
    Object.setPrototypeOf(this, UnauthenticatedUserError.prototype);
  }
}

/**
 *
 * @category Error
 */
export class UnauthorizedUserError extends Error {
// eslint-disable-next-line no-unused-vars
  constructor(context: string, public response: AxiosResponse) {
    super(`${context}: User is not eligible.`);
    Object.setPrototypeOf(this, UnauthorizedUserError.prototype);
  }
}