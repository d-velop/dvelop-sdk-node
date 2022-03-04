import { DvelopContext } from "@dvelop-sdk/core";
import { HttpConfig, HttpResponse, _defaultHttpRequestFunction } from "../../utils/http";

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
 * Default transform-function provided to the {@link getBoEntity}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @template E Return type
 * @internal
 * @category Entity
 */
export function _getBoEntityDefaultTransformFunction<E = any>(response: HttpResponse, _: DvelopContext, __: GetBoEntityParams): E {
  // TODO: delete @odata.context!
  return response.data;
}

/**
 * Factory for {@link getBoEntity}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @template E Return type of the {@link getBoEntity}-function. A corresponding transformFunction has to be supplied.
 * @internal
 * @category Entity
 */
export function _getBoEntityFactory<E>(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: DvelopContext, params: GetBoEntityParams) => E
): (context: DvelopContext, params: GetBoEntityParams) => Promise<E> {
  return async (context: DvelopContext, params: GetBoEntityParams) => {

    let urlEntityKeyValue;
    if (params.keyPropertyType === "number" || params.keyPropertyType === "guid") {
      urlEntityKeyValue = params.keyPropertyValue;
    } else {
      urlEntityKeyValue = `'${params.keyPropertyValue}'`;
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
 */
/* istanbul ignore next */
export async function getBoEntity<E = any>(context: DvelopContext, params: GetBoEntityParams): Promise<E> {
  return await _getBoEntityFactory<E>(_defaultHttpRequestFunction, _getBoEntityDefaultTransformFunction)(context, params);
}