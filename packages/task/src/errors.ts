import { AxiosResponse } from "axios";
import { Task } from "./task";

/**
 *
 * @category Error
 */
export class UnauthenticatedError extends Error {
// eslint-disable-next-line no-unused-vars
  constructor(context: string, public response: AxiosResponse) {
    super(`${context}: Unauthenticated User.`);
    Object.setPrototypeOf(this, UnauthenticatedError.prototype);
  }
}

/**
 *
 * @category Error
 */
export class UnauthorizedError extends Error {
// eslint-disable-next-line no-unused-vars
  constructor(context: string, public response: AxiosResponse) {
    super(`${context}: User is not eligible.`);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
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
export class TaskNotFoundError extends Error {
// eslint-disable-next-line no-unused-vars
  constructor(context: string, public location: string, public response: AxiosResponse) {
    super(`${context}: Task does not exist at location: '${location}'.`);
    Object.setPrototypeOf(this, TaskNotFoundError.prototype);
  }
}