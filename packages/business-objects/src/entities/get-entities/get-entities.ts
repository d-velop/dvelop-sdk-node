import { DvelopContext } from "@dvelop-sdk/core";
import { HttpConfig, HttpResponse, _defaultHttpRequestFunction } from "../../utils/http";

/**
 * Parameters for the {@link getBoEntities}-function.
 * @category Entity
 */
export interface GetBoEntitiesParams {
  /** Name of the model */
  modelName: string;
  /** EntityName in plural (**Singular name won't work**) */
  pluralEntityName: string;
}

/**
 * Default transform-function provided to the {@link getBoEntities}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @template E Return type
 * @internal
 * @category Entity
 */
export function _getBoEntitiesDefaultTransformFunction<E>(response: HttpResponse, _: DvelopContext, __: GetBoEntitiesParams): E[] {
  return response.data.value;
}

/**
 * Factory for {@link getBoEntities}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @template E Return type of the {@link getBoEntities}-function. A corresponding transformFunction has to be supplied.
 * @internal
 * @category Entity
 */
export function _getBoEntitiesFactory<E>(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: DvelopContext, params: GetBoEntitiesParams) => E[]
): (context: DvelopContext, params: GetBoEntitiesParams) => Promise<E[]> {
  return async (context: DvelopContext, params: GetBoEntitiesParams) => {

    const response = await httpRequestFunction(context, {
      method: "GET",
      url: `/businessobjects/custom/${params.modelName}/${params.pluralEntityName}`
    });

    return transformFunction(response, context, params);
  };
}

/**
 * Returns all specified entities from a model.
 * @template E Type for Entity. Defaults to `any`.
 *
 * @example
 * ```typescript
 * import { getBoEntities } from "@dvelop-sdk/business-objects";
 *
 * const employees = await getBoEntities({
 *   systemBaseUri: "https://sacred-heart-hospital.d-velop.cloud",
 *   authSessionId: "3f3c428d452"
 * },{
 *   modelName: "HOSPITALBASEDATA",
 *   pluralEntityName: "employees",
 * });
 * console.log(employees); // [{ employeeId: '1', firstName: 'John Micheal', lastName: 'Dorian', jobTitel: 'senior physician' }, { employeeId: '2', firstName: 'Christopher', lastName: 'Turk', jobTitel: 'chief surgeon' }]
 * ```
 * ---
 * You can also use generics:
 * @example
 * ```typescript
 * import { getBoEntities } from "@dvelop-sdk/business-objects";
 *
 * interface Employee {
 *   employeeId: string;
 *   firstName: string;
 *   lastName: string;
 *   jobTitel: string;
 * }
 *
 * const employees: Employee[] = await getBoEntities<Employee>({
 *   systemBaseUri: "https://sacred-heart-hospital.d-velop.cloud",
 *   authSessionId: "3f3c428d452"
 * },{
 *   modelName: "HOSPITALBASEDATA",
 *   pluralEntityName: "employees"
 * });
 *
 * employees.forEach(e => console.log(e.lastName));
 * // Dorian
 * // Turk
 * ```
 */
/* istanbul ignore next */
export async function getBoEntities<E = any>(context: DvelopContext, params: GetBoEntitiesParams): Promise<E[]> {
  return await _getBoEntitiesFactory<E>(_defaultHttpRequestFunction, _getBoEntitiesDefaultTransformFunction)(context, params);
}