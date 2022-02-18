import { DvelopContext } from "@dvelop-sdk/core";
import { HttpConfig, HttpResponse, _defaultHttpRequestFunction } from "../../utils/http";

/**
 * Parameters for the {@link getBoEntities}-function.
 * @category Entities
 */
export interface GetBoEntitiesParams{
    /** Name of the model */
    modelName:string;
    /** EntityName in plural (**regular won't work**) */
    pluralEntityName:string;
}

/**
 * Default transform-function provided to the {@link getBoEntities}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category Entities
 */
export function _getBoEntitiesDefaultTransformFunction<T>(response: HttpResponse, _: DvelopContext, __: GetBoEntitiesParams):T[] {
  return response.data.value;
}

/**
 * Factory for {@link getBoEntities}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @typeparam T Return type of the getBoEntities-function. A corresponding transformFuntion has to be supplied.
 * @internal
 * @category Entities
 */
export function _getBoEntitiesFactory<T>(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: <T> (response: HttpResponse, context: DvelopContext, params: GetBoEntitiesParams) => T[]
): (context: DvelopContext, params: GetBoEntitiesParams) => Promise<T[]> {
  return async (context: DvelopContext, params: GetBoEntitiesParams) => { 

    const response = await httpRequestFunction(context, {
      method: "GET",
      url: `/businessobjects/custom/${params.modelName}/${params.pluralEntityName}`
    });
    
    return transformFunction<T>(response, context, params);
  };
}

/**
 * Returns all specified entities from a model.
 *
 * ```typescript
 * import { getBoEntities } from "@dvelop-sdk/business-objects";
 *
 * const result = await getBoEntities({ 
 *   systemBaseUri: "https://sacred-heart-hospital.d-velop.cloud",
 *   authSessionId: "3f3c428d452"
 * },{ 
 *     modelName: "HOSPITALBASEDATA", 
 *     pluralEntityName: "employees", 
 * });
 * console.log(result); // [{employeeid: '1', firstName: 'John', lastName: 'Dorian', jobTitel: 'senior physician'}, {employeeid: '2', firstName: 'Christopher', lastName: 'Turk', jobTitel: 'chief surgeon'}]
 * ```
 * ---
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
export async function getBoEntities<T=any> (context :DvelopContext, params: GetBoEntitiesParams):Promise<T[]> {
  return await _getBoEntitiesFactory<T>(_defaultHttpRequestFunction, _getBoEntitiesDefaultTransformFunction) (context, params);
}