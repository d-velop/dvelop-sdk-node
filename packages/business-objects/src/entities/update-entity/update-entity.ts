import { DvelopContext } from "@dvelop-sdk/core";
import { HttpConfig, HttpResponse, _defaultHttpRequestFunction } from "../../utils/http";

/**
 * Parameters for the {@link updateBoEntity}-function.
 * @category Entity
 */
export interface UpdateBoEntityParams{
    modelName:string;
    pluralEntityName:string;
    entityKeyValue:string|number;
    entityChange: Object;
}

/**
 * Factory for {@link updateBoEntity}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @typeparam 
 * @internal
 * @category Entity
 */
export function _updateBoEntityFactory(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: DvelopContext, params: UpdateBoEntityParams) => void
): (context: DvelopContext, params: UpdateBoEntityParams) => Promise<void> {
  return async (context: DvelopContext, params: UpdateBoEntityParams) => { 

    let urlEntityKeyValue; 
    if(typeof params.entityKeyValue === "number") {
      urlEntityKeyValue = params.entityKeyValue;
    } else {
      urlEntityKeyValue = `'${params.entityKeyValue}'`;
    }   

    const response = await httpRequestFunction(context, {
      method: "PUT",
      url: `/businessobjects/custom/${params.modelName}/${params.pluralEntityName}(${urlEntityKeyValue})`,
      data: params.entityChange
    });
    
    return transformFunction(response, context, params);
  };
}

/**
 * Update a business object entity.
 *
 * ```typescript
 * import { updateBoEntity } from "@dvelop-sdk/business-objects";
 *
 * await updateBoEntity({ 
 *   systemBaseUri: "https://sacred-heart-hospital.d-velop.cloud",
 *   authSessionId: "3f3c428d452"
 * },{ 
 *     modelName: "HOSPITALBASEDATA", 
 *     pluralEntityName: "employees", 
 *     entityKeyValue: 1,
 *     entityChange: {
 *       "firstName": "J.D."
 *     }
 * });
 * ```
  * ---
 * You can also write your own function.
 * import { updateBoEntity } from "@dvelop-sdk/business-objects";
 *
 * const myUpdateFunction = _updateBoEntityFactory(_defaultHttpRequestFunction, (response:HttpResponse)=> {
 *   return "My own transform function message.";
 * })
 * 
 * const responseMessage = await myUpdateFunction({ 
 *   systemBaseUri: "https://sacred-heart-hospital.d-velop.cloud",
 *   authSessionId: "3f3c428d452"
 * },{ 
 *     modelName: "HOSPITALBASEDATA", 
 *     pluralEntityName: "employees", 
 *     entityKeyValue: 1,
 *     entityChange: {
 *       "firstName": "J.D."
 *     }
 * });
 * console.log(responseMessage); // My own transform function message 
 * ```
 */
/* istanbul ignore next */
export async function updateBoEntity (context :DvelopContext, params: UpdateBoEntityParams):Promise<void> {
  return await _updateBoEntityFactory(_defaultHttpRequestFunction, ()=>{}) (context, params);
}