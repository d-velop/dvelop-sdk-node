/**
*
* @category Error
*/
export class DvelopSdkError extends Error {
   
  constructor(public message: string, public originalError?: Error) {
    super(message);
    Object.setPrototypeOf(this, DvelopSdkError.prototype);
  }
}

/**
*
* @category Error
*/
/* istanbul ignore next */
export class BadInputError extends DvelopSdkError {
   
  constructor(public message: string, public originalError?: Error) {
    super(message);
    Object.setPrototypeOf(this, BadInputError.prototype);
  }
}

/**
*
* @category Error
*/
/* istanbul ignore next */
export class UnauthorizedError extends DvelopSdkError {
   
  constructor(public message: string, public originalError?: Error) {
    super(message);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
*
* @category Error
*/
/* istanbul ignore next */
export class ForbiddenError extends DvelopSdkError {
   
  constructor(public message: string, public originalError?: Error) {
    super(message);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
*
* @category Error
*/
/* istanbul ignore next */
export class NotFoundError extends DvelopSdkError {
   
  constructor(public message: string, public originalError?: Error) {
    super(message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}