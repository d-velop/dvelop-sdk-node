import { DvelopContext } from "@dvelop-sdk/core";
import { HttpConfig, HttpResponse, _defaultHttpRequestFunction } from "../../utils/http";

/**
 * Parameters for the {@link getBoEntities}-function.
 * @category Entities
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
 * @category Entities
 */
export function _getBoEntitiesDefaultTransformFunction<E>(response: HttpResponse, _: DvelopContext, __: GetBoEntitiesParams): E[] {
  return response.data.value;
}

/**
 * Factory for {@link getBoEntities}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @template E Return type of the {@link getBoEntities}-function. A corresponding transformFunction has to be supplied.
 * @internal
 * @category Entities
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
 * const result = await getBoEntities({
 *   systemBaseUri: "https://sacred-heart-hospital.d-velop.cloud",
 *   authSessionId: "3f3c428d452"
 * },{
 *   modelName: "HOSPITALBASEDATA",
 *   pluralEntityName: "employees",
 * });
 * console.log(result); // [{employeeid: '1', firstName: 'John', lastName: 'Dorian', jobTitel: 'senior physician'}, {employeeid: '2', firstName: 'Christopher', lastName: 'Turk', jobTitel: 'chief surgeon'}]
 * ```
 * ---
 *
 * @example
 * You can also use generics:
 * ```typescript
 * import { getBoEntities } from "@dvelop-sdk/business-objects";
 *
 * interface MyEntity{
 *   lastName: string;
 * }
 *
 * const result: MyEntity[] = await getBoEntities<MyEntity>({
 *   systemBaseUri: "https://sacred-heart-hospital.d-velop.cloud",
 *   authSessionId: "3f3c428d452"
 * },{
 *   modelName: "HOSPITALBASEDATA",
 *   pluralEntityName: "employees",
 * });
 *
 * result.forEach(entity => {
 *   console.log(entity.lastName);
 * });
 * // Dorian
 * // Turk
 * ```
 */
/* istanbul ignore next */
export async function getBoEntities<E = any>(context: DvelopContext, params: GetBoEntitiesParams): Promise<E[]> {
  return await _getBoEntitiesFactory<E>(_defaultHttpRequestFunction, _getBoEntitiesDefaultTransformFunction)(context, params);
}