import { DvelopContext, DvelopHttpResponse as HttpResponse } from "@dvelop-sdk/core";
import { HttpConfig, _defaultHttpRequestFunction } from "../../utils/http";

/**
 * Parameters for the {@link deleteBoEntity}-function.
 * @category Entity
 */
export interface DeleteBoEntityParams{
    modelName: string;
    pluralEntityName: string;
    entityKeyValue: string|number;
}

/**
 * Factory for {@link deleteBoEntity}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @typeparam 
 * @internal
 * @category Entity
 */
export function _deleteBoEntityFactory(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: DvelopContext, params: DeleteBoEntityParams) => void
): (context: DvelopContext, params: DeleteBoEntityParams) => Promise<void> {
  return async (context: DvelopContext, params: DeleteBoEntityParams) => { 

    let urlEntityKeyValue; 
    if(typeof params.entityKeyValue === "number") {
      urlEntityKeyValue = params.entityKeyValue;
    } else {
      urlEntityKeyValue = `'${params.entityKeyValue}'`;
    }    

    const response = await httpRequestFunction(context, {
      method: "DELETE",
      url: `/businessobjects/custom/${params.modelName}/${params.pluralEntityName}(${urlEntityKeyValue})`
    });
    
    return transformFunction(response, context, params);
  };
}

/**
 * Delete a business object entity.
 *
 * ```typescript
 * import { deleteBoEntity } from "@dvelop-sdk/business-objects";
 *
 * await deleteBoEntity({ 
 *   systemBaseUri: "https://sacred-heart-hospital.d-velop.cloud",
 *   authSessionId: "3f3c428d452"
 * },{ 
 *     modelName: "HOSPITALBASEDATA", 
 *     pluralEntityName: "employees", 
 *     entityKeyValue: 1
 * });
 * ```
  * ---
 * You can also write your own function, for example to get a notification, if the entity requested for deletion doesn't exist.
 * import { deleteBoEntity } from "@dvelop-sdk/business-objects";
 *
 * const myDeleteFunction = _deleteBoEntityFactory(_defaultHttpRequestFunction, (response:HttpResponse)=> {
 *   if(response.status === 204) {
 *     return "Entity requested for deletion does not exist.";
 *   }
 * })
 * 
 * const responseMessage = await myDeleteFunction({ 
 *   systemBaseUri: "https://sacred-heart-hospital.d-velop.cloud",
 *   authSessionId: "3f3c428d452"
 * },{ 
 *     modelName: "HOSPITALBASEDATA", 
 *     pluralEntityName: "employees", 
 *     entityKeyValue: 1
 * });
 * console.log(responseMessage); // Entity requested for deletion does not exist.
 * ```
 */
/* istanbul ignore next */
export async function deleteBoEntity(context :DvelopContext, params: DeleteBoEntityParams): Promise<void> {
  return await _deleteBoEntityFactory(_defaultHttpRequestFunction, ()=>{}) (context, params);
}