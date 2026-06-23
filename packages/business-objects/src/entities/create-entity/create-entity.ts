import { DvelopContext, DvelopOptions, dvelopFetch } from "@dvelop-sdk/core";
import { ensureSuccessResponse } from "../../utils/business-objects-error";

/**
 * Parameters for the {@link createBoEntity}-function.
 * @template E Type for Entity. Defaults to `any`.
 * @category Entity
 */
export interface CreateBoEntityParams<E = any> {
  /** Name of the model */
  modelName: string;
  /** EntityName in plural (**Singular name won't work**) */
  pluralEntityName: string;
  /** Entity to be created*/
  entity: E;
}

/**
 * Default `onResponse` provided to the {@link createBoEntity}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category Entity
 */
export async function onResponse(response: Response): Promise<void> {
  await ensureSuccessResponse(response);
}

/**
 * Create a business object entity.
 * @template E Type for Entity. Defaults to `any`.
 *
 * @example
 * ```typescript
 * import { createBoEntity } from "@dvelop-sdk/business-objects";
 *
 * await createBoEntity({
 *   systemBaseUri: "https://sacred-heart-hospital.d-velop.cloud",
 *   authSessionId: "3f3c428d452"
 * },{
 *   modelName: "HOSPITALBASEDATA",
 *   pluralEntityName: "employees",
 *   entity: {
 *     employeeId: "1",
 *     firstName: "John Micheal",
 *     lastName: "Dorian",
 *     jobTitel: "senior physician"
 *   }
 * });
 * ```
 * ---
 * You can also use generics:
 * @example
 * ```typescript
 * import { createBoEntity } from "@dvelop-sdk/business-objects";
 *
 * interface Employee {
 *   employeeId: string;
 *   firstName: string;
 *   lastName: string;
 *   jobTitel: string;
 * }
 *
 * await createBoEntity<Employee>({
 *   systemBaseUri: "https://sacred-heart-hospital.d-velop.cloud",
 *   authSessionId: "3f3c428d452"
 * },{
 *   modelName: "HOSPITALBASEDATA",
 *   pluralEntityName: "employees",
 *   entity: {
 *     employeeId: "1",
 *     firstName: "John Micheal",
 *     lastName: "Dorian",
 *     jobTitel: "senior physician"
 *   }
 * });
 * ```
 *
 * @category Entity
 */
export async function createBoEntity<E = any>(context: DvelopContext, params: CreateBoEntityParams<E>): Promise<void>;
export async function createBoEntity<T, E = any>(context: DvelopContext, params: CreateBoEntityParams<E>, options: DvelopOptions<T>): Promise<T>;
export async function createBoEntity<T, E = any>(
  context: DvelopContext,
  params: CreateBoEntityParams<E>,
  options: DvelopOptions<T | void> = {
    onResponse: onResponse
  }
): Promise<T | void> {
  return dvelopFetch(context, `/businessobjects/custom/${params.modelName}/${params.pluralEntityName}`, {
    method: "POST",
    body: JSON.stringify(params.entity)
  }, options);
}
