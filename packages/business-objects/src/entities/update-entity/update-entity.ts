import { DvelopContext } from "@dvelop-sdk/core";
import { HttpConfig, HttpResponse, _defaultHttpRequestFunction } from "../../utils/http";

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
  /** Value for the key-property of the entity */
  entityKeyValue: string | number;
  /** [Partial](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype) of `E`. Given properties will be updated. */
  entityChange: Partial<E>;
}

/**
 * Factory for {@link updateBoEntity}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @template E Return type of the {@link updateBoEntity}-function. A corresponding transformFunction has to be supplied.
 * @internal
 * @category Entity
 */
export function _updateBoEntityFactory<E, R>(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: DvelopContext, params: UpdateBoEntityParams<E>) => R
): (context: DvelopContext, params: UpdateBoEntityParams) => Promise<R> {
  return async (context: DvelopContext, params: UpdateBoEntityParams<E>) => {

    let urlEntityKeyValue;
    if (typeof params.entityKeyValue === "number") {
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
 *
 * @example
 * ```typescript
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
export async function updateBoEntity<E = any>(context: DvelopContext, params: UpdateBoEntityParams<E>): Promise<void> {
  return await _updateBoEntityFactory<E, void>(_defaultHttpRequestFunction, () => { })(context, params);
}