import { DvelopContext } from "@dvelop-sdk/core";
import { HttpConfig, HttpResponse, _defaultHttpRequestFunction } from "../../utils/http";

/**
 * Parameters for the {@link getBoEntities}-function.
 * @category Entity
 */
export interface GetBoEntitiesParams {
  /** Name of the model */
  modelName: string;
  /** EntityName in plural (**Singular name won't work**) */
  pluralEntityName: string;
}

/**
 * Page of a searchResult. There might be more than one page.
 * @category Entity
 */
export interface GetBoEntitiesResultPage<E = any> {
  /** Array of entitiess found */
  value: E[]
  /** Function that returns the next page. Undefined if there is none. */
  getNextPage?: () => Promise<GetBoEntitiesResultPage<E>>;
}

/**
 * Default transform-function provided to the {@link getBoEntities}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @template E Return type
 * @internal
 * @category Entity
 */
export function _getBoEntitiesDefaultTransformFunctionFactory<E>(httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>): (response: HttpResponse, context: DvelopContext, params: GetBoEntitiesParams) => GetBoEntitiesResultPage<E> {
  return <E>(response: HttpResponse, context: DvelopContext, params: GetBoEntitiesParams) => {

    let result: GetBoEntitiesResultPage<E> = {
      value: response.data.value
    };

    if (response.data["@odata.nextLink"]) {
      result.getNextPage = async () => {
        const nextResponse: HttpResponse = await httpRequestFunction(context, {
          method: "GET",
          url: response.data["@odata.nextLink"]
        });
        return _getBoEntitiesDefaultTransformFunctionFactory<E>(httpRequestFunction)(nextResponse, context, params);
      };
    }

    return result;
  };
}

/**
 * Factory for {@link getBoEntities}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @template E Return type of the {@link getBoEntities}-function. A corresponding transformFunction has to be supplied.
 * @internal
 * @category Entity
 */
export function _getBoEntitiesFactory<E>(
  httpRequestFunction: (context: DvelopContext, config: HttpConfig) => Promise<HttpResponse>,
  transformFunction: (response: HttpResponse, context: DvelopContext, params: GetBoEntitiesParams) => GetBoEntitiesResultPage<E>
): (context: DvelopContext, params: GetBoEntitiesParams) => Promise<GetBoEntitiesResultPage<E>> {
  return async (context: DvelopContext, params: GetBoEntitiesParams) => {

    const response = await httpRequestFunction(context, {
      method: "GET",
      url: `/businessobjects/custom/${params.modelName}/${params.pluralEntityName}`
    });

    return transformFunction(response, context, params);
  };
}

/**
 * Returns all specified entities from a model. This result might be partial due to the default page size.
 * You can navigate to the next pages using the function ```getNextPage```. If the function is undefined, the page does not exist.
 *
 * @example
 * ```typescript
 * import { getBoEntities } from "@dvelop-sdk/business-objects";
 *
 * const employees = await getBoEntities({
 *   systemBaseUri: "https://sacred-heart-hospital.d-velop.cloud",
 *   authSessionId: "3f3c428d452"
 * },{
 *   modelName: "HOSPITALBASEDATA",
 *   pluralEntityName: "employees",
 * });
 * console.log(employees.value); // [{ employeeId: '1', firstName: 'John Micheal', lastName: 'Dorian', jobTitel: 'senior physician' }, { employeeId: '2', firstName: 'Christopher', lastName: 'Turk', jobTitel: 'chief surgeon' }]
 * let nextPage = await employees.getNextPage();
 * console.log(nextPage?.value.length);
 * ```
 */
/* istanbul ignore next */
export async function getBoEntities<E = any>(context: DvelopContext, params: GetBoEntitiesParams): Promise<GetBoEntitiesResultPage<E>> {
  return await _getBoEntitiesFactory<E>(_defaultHttpRequestFunction, _getBoEntitiesDefaultTransformFunctionFactory(_defaultHttpRequestFunction))(context, params);
}