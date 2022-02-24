import { DvelopContext, DvelopHttpResponse as HttpResponse } from "@dvelop-sdk/core";
import { HttpConfig, _defaultHttpRequestFunction } from "../../utils/http";

/**
 * Parameters for the {@link createBoEntity}-function.
 * @category Entity
 */
export interface CreateBoEntityParams {
    modelName: string;
    pluralEntityName: string;
    entity: Object;
}

/**
 * Factory for {@link createBoEntity}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @typeparam 
 * @internal
 * @category Entity
 */
export function _createBoEntityFactory(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: DvelopContext, params: CreateBoEntityParams) => void
): (context: DvelopContext, params: CreateBoEntityParams) => Promise<void> {
  return async (context: DvelopContext, params: CreateBoEntityParams) => {

    const response = await httpRequestFunction(context, {
      method: "POST",
      url: `/businessobjects/custom/${params.modelName}/${params.pluralEntityName}`,
      data: params.entity
    });

    return transformFunction(response, context, params);
  };
}

/**
 * Create a business object entity.
 *
 * ```typescript
 * import { createBoEntity } from "@dvelop-sdk/business-objects";
 *
 * await createBoEntity({ 
 *   systemBaseUri: "https://sacred-heart-hospital.d-velop.cloud",
 *   authSessionId: "3f3c428d452"
 * },{ 
 *     modelName: "HOSPITALBASEDATA", 
 *     pluralEntityName: "employees", 
 *     entity: {
 *       "employeeid": "1",
 *       "firstName": "John",
 *       "lastName": "Dorian",
 *       "jobTitel": "senior physician"
 *     }
 * });
 * ```
* ---
 * You can also write your own function, for example to get a notification, if the entity was successfully created.
 * import { createBoEntity } from "@dvelop-sdk/business-objects";
 *
 * const myCreateFunction = _createBoEntityFactory(_defaultHttpRequestFunction, (response:HttpResponse)=> {
 *   if(response.status == 201) {
 *     retrun "Entity created successfully.";
 *   }
 * })
 * 
 * const responseMessage = await myCreateFunction({ 
 *   systemBaseUri: "https://sacred-heart-hospital.d-velop.cloud",
 *   authSessionId: "3f3c428d452"
 * },{ 
 *     modelName: "HOSPITALBASEDATA",
 *     pluralEntityName: "employees",
 *     entity: {
 *       "employeeid": "1",
 *       "firstName": "John",
 *       "lastName": "Dorian",
 *       "jobTitel": "senior physician"
 * }
 * });
 * console.log(responseMessage); // Entity created successfully.
 * ```
 */
/* istanbul ignore next */
export async function createBoEntity(context: DvelopContext, params: CreateBoEntityParams): Promise<void> {
  return await _createBoEntityFactory(_defaultHttpRequestFunction, ()=>{}) (context, params);
}