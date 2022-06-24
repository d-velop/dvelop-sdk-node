import { DvelopSdkError } from "@dvelop-sdk/core";

/**
* Indicates a problem while Logging
* @category Error
*/
export class LoggingError extends DvelopSdkError {
  // eslint-disable-next-line no-unused-vars
  constructor(message: string, originalError?: Error) {
    super(message, originalError);
    Object.setPrototypeOf(this, LoggingError.prototype);
  }
}