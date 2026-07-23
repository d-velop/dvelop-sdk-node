import { DvelopSdkError } from "../errors/errors";

/**
* Indicates an error with the TraceContext.
* @category Error
*/
export class TraceContextError extends DvelopSdkError {
   
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, TraceContextError.prototype);
  }
}