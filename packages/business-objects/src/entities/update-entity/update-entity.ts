import { DvelopContext, DvelopOptions, dvelopFetch } from "@dvelop-sdk/core";
import { ensureSuccessResponse } from "../../utils/business-objects-error";

/**
 * Parameters for the {@link updateBoEntity}-function.
 * @template E Type for Entity. Defaults to `any`.
 * @category Entity
 */
export interface UpdateBoEntityParams<E = any> {
  /** Name of the model */
  modelName: string;
  /** EntityName in plural (**Singular name won't work**) */
  pluralEntityName: string;
  /** Type of the key property */
  keyPropertyType: "string" | "number" | "guid";
  /** Key-property of the entity to be updated */
  keyPropertyValue: string | number;
  /** [Partial](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype) of `E`. Given properties will be updated. */
  entityChange: Partial<E>;
}

/**
 * Default `onResponse` provided to the {@link updateBoEntity}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category Entity
 */
export async function onResponse(response: Response): Promise<void> {
  await ensureSuccessResponse(response);
}

/**
 * Update a business object entity.
 * @template E Type for Entity. Defaults to `any`.
 *
 * @example
 * ```typescript
 * import { updateBoEntity } from "@dvelop-sdk/business-objects";
 *
 * await updateBoEntity({
 *   systemBaseUri: "https://sacred-heart-hospital.d-velop.cloud",
 *   authSessionId: "3f3c428d452"
 * },{
 *   modelName: "HOSPITALBASEDATA",
 *   pluralEntityName: "employees",
 *   keyPropertyType: "number", //"string", "number" or "guid"
 *   keyPropertyValue: 1,
 *   entityChange: {
 *     "firstName": "J.D."
 *   }
 * });
 * ```
 * ---
 * You can also use generics:
 * @example
 * ```typescript
 * import { updateBoEntity } from "@dvelop-sdk/business-objects";
 *
 * interface Employee {
 *   employeeId: string;
 *   firstName: string;
 *   lastName: string;
 *   jobTitel: string;
 * }
 *
 * await updateBoEntity<Employee>({
 *   systemBaseUri: "https://sacred-heart-hospital.d-velop.cloud",
 *   authSessionId: "3f3c428d452"
 * },{
 *   modelName: "HOSPITALBASEDATA",
 *   pluralEntityName: "employees",
 *   keyPropertyType: "number", //"string", "number" or "guid"
 *   keyPropertyValue: 1,
 *   entityChange: {
 *     "firstName": "John Micheal (J.D.)"
 *   }
 * });
 * ```
 *
 * @category Entity
 */
export async function updateBoEntity<E = any>(context: DvelopContext, params: UpdateBoEntityParams<E>): Promise<void>;
export async function updateBoEntity<T, E = any>(context: DvelopContext, params: UpdateBoEntityParams<E>, options: DvelopOptions<T>): Promise<T>;
export async function updateBoEntity<T, E = any>(
  context: DvelopContext,
  params: UpdateBoEntityParams<E>,
  options: DvelopOptions<T | void> = {
    onResponse: onResponse
  }
): Promise<T | void> {

  let urlEntityKeyValue: string | number;
  if (params.keyPropertyType === "number" || params.keyPropertyType === "guid") {
    urlEntityKeyValue = params.keyPropertyValue;
  } else {
    urlEntityKeyValue = `'${params.keyPropertyValue}'`;
  }

  return dvelopFetch(context, `/businessobjects/custom/${params.modelName}/${params.pluralEntityName}(${urlEntityKeyValue})`, {
    method: "PATCH",
    body: JSON.stringify(params.entityChange)
  }, options);
}
