import { DvelopContext } from "@dvelop-sdk/core";
import { HttpConfig, HttpResponse, _defaultHttpRequestFunction } from "../../utils/http";

/**
 * Parameters for the {@link getBoEntity}-function.
 * @category Entity
 */
export interface GetBoEntityParams{
    modelName:string;
    pluralEntityName:string;
    entityKeyValue:string|number;
}

/**
 * Default transform-function provided to the {@link getBoEntity}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category Entity
 */
export function _getBoEntityDefaultTransformFunction <T extends Object>(response: HttpResponse, _: DvelopContext, __: GetBoEntityParams): T {
  // TODO delete @odata.context!
  return response.data;
}

/**
 * Factory for {@link getBoEntity}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @typeparam T Return type of the getBoEntity-function. A corresponding transformFuntion has to be supplied.
 * @internal
 * @category Entity
 */
export function _getBoEntityFactory<T>(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: DvelopContext, params: GetBoEntityParams) => T
): (context: DvelopContext, params: GetBoEntityParams) => Promise<T> {
  return async (context: DvelopContext, params: GetBoEntityParams) => { 

    let urlEntityKeyValue; 
    if(typeof params.entityKeyValue === "number") {
      urlEntityKeyValue = params.entityKeyValue;
    } else {
      urlEntityKeyValue = `'${params.entityKeyValue}'`;
    }   

    const response = await httpRequestFunction(context, {
      method: "GET",
      url: `/businessobjects/custom/${params.modelName}/${params.pluralEntityName}(${urlEntityKeyValue})`
    });
    
    return transformFunction(response, context, params);
  };
}

/**
 * Returns one specified entity from a model.
 *
 * ```typescript
 * import { getBoEntity } from "@dvelop-sdk/business-objects";
 *
 * const result = await getBoEntity({ 
 *   systemBaseUri: "https://sacred-heart-hospital.d-velop.cloud",
 *   authSessionId: "3f3c428d452"
 * },{ 
 *     modelName: "HOSPITALBASEDATA", 
       pluralEntityName: "employees", 
       entityKeyValue: "1"
 * });
 * console.log(result); // {employeeid: '1', firstName: 'John', lastName: 'Dorian', jobTitel: 'senior physician'}
 * ```
 * ---
 * You can also use generics:
 * ```typescript
 * import { getBoEntity } from "@dvelop-sdk/business-objects";
 * 
 * interface MyEntity{
 *   lastName: string;
 * }
 * 
 * const result: MyEntity[] = await getBoEntity<MyEntity>({ 
 *   systemBaseUri: "https://sacred-heart-hospital.d-velop.cloud",
 *   authSessionId: "3f3c428d452"
 * },{ 
 *   modelName: "HOSPITALBASEDATA", 
 *   pluralEntityName: "employees", 
 *   entityKeyValue: "1"
 * });
 * 
 * console.log(entity.lastName); // Dorian
 * ```
 */
/* istanbul ignore next */
export async function getBoEntity<T> (context :DvelopContext, params: GetBoEntityParams): Promise<T> {
  return await _getBoEntityFactory<T>(_defaultHttpRequestFunction, _getBoEntityDefaultTransformFunction) (context, params);
}