import { DvelopSdkError } from "../errors/errors";
import merge = require("lodash.merge");

/**
*
* @category Error
*/
export class DeepMergeError extends DvelopSdkError {
  // eslint-disable-next-line no-unused-vars
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, DeepMergeError.prototype);
  }
}

export function deepMergeObjects<T extends Object = Object>(...objects: T[]): T {

  objects.forEach(o => {
    if (typeof o !== "object") {
      throw new DeepMergeError("deepMergeObjects-function can only accept objects.");
    }
  });

  if (objects.length < 2) {
    throw new DeepMergeError("Must supply at least two objects to deepMergeObjects-function.");
  } else if (objects.length === 2) {
    return merge(objects[0], objects[1]);
  } else {
    return objects.reduce((o1, o2) => {
      return deepMergeObjects(o1, o2);
    });
  }
}
