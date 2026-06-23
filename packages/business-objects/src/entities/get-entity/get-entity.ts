import { DvelopContext, DvelopOptions, dvelopFetch } from "@dvelop-sdk/core";
import { ensureSuccessResponse } from "../../utils/business-objects-error";

/**
 * Parameters for the {@link getBoEntity}-function.
 * @category Entity
 */
export interface GetBoEntityParams {
  /** Name of the model */
  modelName: string;
  /** EntityName in plural (**Singular name won't work**) */
  pluralEntityName: string;
  /** Type of the key property */
  keyPropertyType: "string" | "number" | "guid";
  /** Key-property of the entity to be retrieved */
  keyPropertyValue: string | number;
}

/**
 * Default `onResponse` provided to the {@link getBoEntity}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category Entity
 */
export async function onResponse(response: Response): Promise<any> {
  await ensureSuccessResponse(response);
  const entity: any = await response.json();
  if (entity && typeof entity === "object" && entity["@odata.context"]) {
    delete entity["@odata.context"];
  }
  return entity;
}

/**
 * Returns one specified entity from a model.
 * @template E Type for Entity. Defaults to `any`.
 *
 * @example
 * ```typescript
 * import { getBoEntity } from "@dvelop-sdk/business-objects";
 *
 * const jd = await getBoEntity({
 *   systemBaseUri: "https://sacred-heart-hospital.d-velop.cloud",
 *   authSessionId: "3f3c428d452"
 * },{
 *   modelName: "HOSPITALBASEDATA",
 *   pluralEntityName: "employees",
 *   keyPropertyType: "string", //"string", "number" or "guid"
 *   keyPropertyValue: "1"
 * });
 * console.log(jd); // { employeeId: '1', firstName: 'John Micheal', lastName: 'Dorian', jobTitel: 'senior physician' }
 * ```
 * ---
 * You can also use generics:
 * @example
 * ```typescript
 * import { getBoEntity } from "@dvelop-sdk/business-objects";
 *
 * interface Employee {
 *   employeeId: string;
 *   firstName: string;
 *   lastName: string;
 *   jobTitel: string;
 * }
 *
 * const jd: Employee = await getBoEntity<Employee>({
 *   systemBaseUri: "https://sacred-heart-hospital.d-velop.cloud",
 *   authSessionId: "3f3c428d452"
 * },{
 *   modelName: "HOSPITALBASEDATA",
 *   pluralEntityName: "employees",
 *   keyPropertyType: "string", //"string", "number" or "guid"
 *   keyPropertyValue: "1"
 * });
 *
 * console.log(jd.lastName); // Dorian
 * ```
 *
 * @category Entity
 */
export async function getBoEntity<E = any>(context: DvelopContext, params: GetBoEntityParams): Promise<E>;
export async function getBoEntity<T>(context: DvelopContext, params: GetBoEntityParams, options: DvelopOptions<T>): Promise<T>;
export async function getBoEntity<E = any>(
  context: DvelopContext,
  params: GetBoEntityParams,
  options: DvelopOptions<E> = {
    onResponse: onResponse
  }
): Promise<E> {

  let urlEntityKeyValue: string | number;
  if (params.keyPropertyType === "number" || params.keyPropertyType === "guid") {
    urlEntityKeyValue = params.keyPropertyValue;
  } else {
    urlEntityKeyValue = `'${params.keyPropertyValue}'`;
  }

  return dvelopFetch(context, `/businessobjects/custom/${params.modelName}/${params.pluralEntityName}(${urlEntityKeyValue})`, { method: "GET" }, options);
}
