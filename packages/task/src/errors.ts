import { AxiosResponse } from "axios";
import { Task } from "./task";

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

/**
 *
 * @category Error
 */
export class NoTaskLocationError extends Error {
// eslint-disable-next-line no-unused-vars
  constructor(context: string, public task: string | Task) {
    super(`${context}: No location given for task.`);
    Object.setPrototypeOf(this, NoTaskLocationError.prototype);
  }
}

/**
 *
 * @category Error
 */
export class TaskNoFoundError extends Error {
// eslint-disable-next-line no-unused-vars
  constructor(context: string, public location: string, public response: AxiosResponse) {
    super(`${context}: Task does not exist at location: '${location}'.`);
    Object.setPrototypeOf(this, TaskNoFoundError.prototype);
  }
}