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
  /** Type of the key property */
  keyPropertyType: "string" | "number" | "guid";
  /** Key-property of the entity to be updated */
  keyPropertyValue: string | number;
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
    if (params.keyPropertyType === "number" || params.keyPropertyType === "guid") {
      urlEntityKeyValue = params.keyPropertyValue;
    } else {
      urlEntityKeyValue = `'${params.keyPropertyValue}'`;
    }

    const response = await httpRequestFunction(context, {
      method: "PATCH",
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
 *   modelName: "HOSPITALBASEDATA",
 *   pluralEntityName: "employees",
 *   keyPropertyType: "number", //"string", "number" or "guid"
 *   keyPropertyValue: 1,
 *   entityChange: {
 *     "firstName": "J.D."
 *   }
 * });
 * ```
 * ---
 * You can also use generics:
 * @example
 * ```typescript
 * import { updateBoEntity } from "@dvelop-sdk/business-objects";
 *
 * interface Employee {
 *   employeeId: string;
 *   firstName: string;
 *   lastName: string;
 *   jobTitel: string;
 * }
 *
 * await updateBoEntity<Employee>({
 *   systemBaseUri: "https://sacred-heart-hospital.d-velop.cloud",
 *   authSessionId: "3f3c428d452"
 * },{
 *   modelName: "HOSPITALBASEDATA",
 *   pluralEntityName: "employees",
 *   keyPropertyType: "number", //"string", "number" or "guid"
 *   keyPropertyValue: 1,
 *   entityChange: {
 *     "firstName": "John Micheal (J.D.)"
 *   }
 * });
 * ```
 */
/* istanbul ignore next */
export async function updateBoEntity<E = any>(context: DvelopContext, params: UpdateBoEntityParams<E>): Promise<void> {
  return await _updateBoEntityFactory<E, void>(_defaultHttpRequestFunction, () => { })(context, params);
}
