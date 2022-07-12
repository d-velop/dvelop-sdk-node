import { DvelopSdkError } from "../errors/errors";

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

    const result: Partial<T> = {};
    const o1: T = objects[0];
    const o2: T = objects[1];

    Object.keys(o1).forEach(key => {

      const property: any = o1[key as keyof T];

      if (typeof property === "object") {
        result[key as keyof T] = JSON.parse(JSON.stringify(property));
      } else {
        result[key as keyof T] = property;
      }
    });

    Object.keys(o2).forEach(key => {

      const property: any = o2[key as keyof T];

      if (result[key as keyof T]) {
        if (typeof result[key as keyof T] === "object" && typeof property === "object") {
          result[key as keyof T] = deepMergeObjects(result[key as keyof T], property);
        } else if (typeof property === "object") {
          result[key as keyof T] = JSON.parse(JSON.stringify(property));
        } else {
          result[key as keyof T] = property;
        }
      } else {
        if (typeof property === "object") {
          result[key as keyof T] = JSON.parse(JSON.stringify(property));
        } else {
          result[key as keyof T] = property;
        }
      }
    });

    return result as T;
  } else {
    return objects.reduce((o1, o2) => {
      return deepMergeObjects(o1, o2);
    });
  }
}
