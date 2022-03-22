import { DvelopContext, DvelopHttpResponse as HttpResponse } from "@dvelop-sdk/core";
import { HttpConfig, _defaultHttpRequestFunction } from "../../utils/http";

/**
 * Parameters for the {@link createBoEntity}-function.
 * @template E Type for Entity. Defaults to `any`.
 * @category Entity
 */
export interface CreateBoEntityParams<E = any> {
  /** Name of the model */
  modelName: string;
  /** EntityName in plural (**Singular name won't work**) */
  pluralEntityName: string;
  /** Entity to be created*/
  entity: E;
}

/**
 * Factory for {@link createBoEntity}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @template E Type for Entity to be created.
 * @template R Return type of the {@link createBoEntity}-function. A corresponding transformFunction has to be supplied.
 * @internal
 * @category Entity
 */
export function _createBoEntityFactory<E, R>(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: DvelopContext, params: CreateBoEntityParams<E>) => R
): (context: DvelopContext, params: CreateBoEntityParams<E>) => Promise<R> {
  return async (context: DvelopContext, params: CreateBoEntityParams<E>) => {

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
 * @template E Type for Entity. Defaults to `any`.
 *
 * @example
 * ```typescript
 * import { createBoEntity } from "@dvelop-sdk/business-objects";
 *
 * await createBoEntity({
 *   systemBaseUri: "https://sacred-heart-hospital.d-velop.cloud",
 *   authSessionId: "3f3c428d452"
 * },{
 *   modelName: "HOSPITALBASEDATA",
 *   pluralEntityName: "employees",
 *   entity: {
 *     employeeId: "1",
 *     firstName: "John Micheal",
 *     lastName: "Dorian",
 *     jobTitel: "senior physician"
 *   }
 * });
 * ```
 * ---
 * You can also use generics:
 * @example
 * ```typescript
 * import { createBoEntity } from "@dvelop-sdk/business-objects";
 *
 * interface Employee {
 *   employeeId: string;
 *   firstName: string;
 *   lastName: string;
 *   jobTitel: string;
 * }
 *
 * await create<Employee>({
 *   systemBaseUri: "https://sacred-heart-hospital.d-velop.cloud",
 *   authSessionId: "3f3c428d452"
 * },{
 *   modelName: "HOSPITALBASEDATA",
 *   pluralEntityName: "employees",
 *   entity: {
 *     employeeId: "1",
 *     firstName: "John Micheal",
 *     lastName: "Dorian",
 *     jobTitel: "senior physician"
 *   }
 * });
 * ```
 */
/* istanbul ignore next */
export async function createBoEntity<E = any>(context: DvelopContext, params: CreateBoEntityParams<E>): Promise<void> {
  return await _createBoEntityFactory<E, void>(_defaultHttpRequestFunction, () => { })(context, params);
}