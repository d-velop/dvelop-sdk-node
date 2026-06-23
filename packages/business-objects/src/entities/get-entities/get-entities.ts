import { DvelopContext, DvelopOptions, dvelopFetch } from "@dvelop-sdk/core";
import { ensureSuccessResponse } from "../../utils/business-objects-error";

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
  /** Array of entities found */
  value: E[];
  /** Function that returns the next page. Undefined if there is none. */
  getNextPage?: () => Promise<GetBoEntitiesResultPage<E>>;
}

/**
 * Builds a {@link GetBoEntitiesResultPage} from a response and wires up paging via the
 * OData `@odata.nextLink`. The `context` is captured so that `getNextPage` can issue a
 * follow-up request.
 * @internal
 * @category Entity
 */
export async function buildResultPage<E = any>(response: Response, context: DvelopContext): Promise<GetBoEntitiesResultPage<E>> {

  await ensureSuccessResponse(response);
  const data: any = await response.json();

  const result: GetBoEntitiesResultPage<E> = {
    value: data.value
  };

  const nextLink: string | undefined = data["@odata.nextLink"];
  if (nextLink) {
    const systemBaseUri: string = context.systemBaseUri ?? "";
    const nextPath: string = systemBaseUri && nextLink.startsWith(systemBaseUri) ? nextLink.slice(systemBaseUri.length) : nextLink;
    result.getNextPage = () => dvelopFetch(context, nextPath, { method: "GET" }, {
      onResponse: (nextResponse: Response) => buildResultPage<E>(nextResponse, context)
    });
  }

  return result;
}

/**
 * Default `onResponse` provided to the {@link getBoEntities}-function. Captures the `context`
 * so that paging is possible. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category Entity
 */
export function defaultOnResponseFactory<E = any>(context: DvelopContext): (response: Response) => Promise<GetBoEntitiesResultPage<E>> {
  return (response: Response) => buildResultPage<E>(response, context);
}

/**
 * Returns all specified entities from a model. This result might be partial due to the default page size.
 * You can navigate to the next pages using the function ```getNextPage```. If the function is undefined, the page does not exist.
 *
 * @example
 * ```typescript
 * import { getBoEntities } from "@dvelop-sdk/business-objects";
 *
 * const resultPage: GetBoEntitiesResultPage = await getBoEntities({
 *   systemBaseUri: "https://sacred-heart-hospital.d-velop.cloud",
 *   authSessionId: "3f3c428d452"
 * },{
 *   modelName: "HOSPITALBASEDATA",
 *   pluralEntityName: "employees"
 * });
 *
 * let employees = resultPage.value;
 *
 * // Use this for paging
 * let page = resultPage;
 * while (page.getNextPage) {
 *   page = await page.getNextPage();
 *   employees = employees.concat(page.value);
 * }
 * ```
 * ---
 * You can also use generics:
 * @example
 * ```typescript
 * import { getBoEntities } from "@dvelop-sdk/business-objects";
 *
 * interface Employee {
 *   employeeId: string;
 *   firstName: string;
 *   lastName: string;
 *   jobTitel: string;
 * }
 *
 * const resultPage: GetBoEntitiesResultPage<Employee> = await getBoEntities<Employee>({
 *   systemBaseUri: "https://sacred-heart-hospital.d-velop.cloud",
 *   authSessionId: "3f3c428d452"
 * }, {
 *   modelName: "HOSPITALBASEDATA",
 *   pluralEntityName: "employees"
 * });
 *
 * resultPage.value.forEach(e => console.log(e.lastName));
 * // Dorian
 * // Turk
 * ```
 *
 * @category Entity
 */
export async function getBoEntities<E = any>(context: DvelopContext, params: GetBoEntitiesParams): Promise<GetBoEntitiesResultPage<E>>;
export async function getBoEntities<T>(context: DvelopContext, params: GetBoEntitiesParams, options: DvelopOptions<T>): Promise<T>;
export async function getBoEntities<E = any>(
  context: DvelopContext,
  params: GetBoEntitiesParams,
  options: DvelopOptions<GetBoEntitiesResultPage<E>> = {
    onResponse: defaultOnResponseFactory<E>(context)
  }
): Promise<GetBoEntitiesResultPage<E>> {
  return dvelopFetch(context, `/businessobjects/custom/${params.modelName}/${params.pluralEntityName}`, { method: "GET" }, options);
}
