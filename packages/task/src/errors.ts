import { AxiosResponse } from "axios";
import { Task } from "./task";


/**
 * A given task was invalid. See ```validation```-propery.
 * @category Error
 */
export class InvalidTaskError extends Error {
  // eslint-disable-next-line no-unused-vars
  constructor(context: string, public task: Task, public validation: any, public response: AxiosResponse) {
    super(`${context}: Task was invalid. Validation: ${JSON.stringify(validation)} `);
    Object.setPrototypeOf(this, InvalidTaskError.prototype);
  }
}

/**
 * An authSessionId was invalid or expired.
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
 * AuthSessionId is associated with a user who is not eligible.
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
 * No location was given.
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
 * Task does not exist at given location.
 * @category Error
 */
export class TaskNotFoundError extends Error {
  // eslint-disable-next-line no-unused-vars
  constructor(context: string, public location: string, public response: AxiosResponse) {
    super(`${context}: Task does not exist at location: '${location}'.`);
    Object.setPrototypeOf(this, TaskNotFoundError.prototype);
  }
}

/**
 * Tried to complete a Task which was already completed.
 * @category Error
 */
export class TaskAlreadyCompletedError extends Error {
  // eslint-disable-next-line no-unused-vars
  constructor(context: string, public location: string, public response: AxiosResponse) {
    super(`${context}: Task was already completed at location: ${location} `);
    Object.setPrototypeOf(this, TaskAlreadyCompletedError.prototype);
  }
}