import { DvelopContext, DvelopOptions, dvelopFetch } from "@dvelop-sdk/core";
import { ensureSuccessResponse } from "../../utils/business-objects-error";

/**
 * Parameters for the {@link deleteBoEntity}-function.
 * @category Entity
 */
export interface DeleteBoEntityParams {
  /** Name of the model */
  modelName: string;
  /** EntityName in plural (**Singular name won't work**) */
  pluralEntityName: string;
  /** Type of the key property */
  keyPropertyType: "string" | "number" | "guid";
  /** Key-property of the entity to be deleted */
  keyPropertyValue: string | number;
}

/**
 * Default `onResponse` provided to the {@link deleteBoEntity}-function. See [Advanced Topics](https://github.com/d-velop/dvelop-sdk-node#advanced-topics) for more information.
 * @internal
 * @category Entity
 */
export async function onResponse(response: Response): Promise<void> {
  await ensureSuccessResponse(response);
}

/**
 * Delete a business object entity.
 *
 * @example
 * ```typescript
 * import { deleteBoEntity } from "@dvelop-sdk/business-objects";
 *
 * await deleteBoEntity({
 *   systemBaseUri: "https://sacred-heart-hospital.d-velop.cloud",
 *   authSessionId: "3f3c428d452"
 * },{
 *   modelName: "HOSPITALBASEDATA",
 *   pluralEntityName: "employees",
 *   keyPropertyType: "number", //"string", "number" or "guid"
 *   keyPropertyValue: 1
 * });
 * ```
 * ---
 * You can supply your own `onResponse` to react to the raw response, for example to get a
 * notification if the entity requested for deletion didn't exist.
 * @example
 * ```typescript
 * import { deleteBoEntity } from "@dvelop-sdk/business-objects";
 *
 * const responseMessage: string = await deleteBoEntity({
 *   systemBaseUri: "https://sacred-heart-hospital.d-velop.cloud",
 *   authSessionId: "3f3c428d452"
 * },{
 *   modelName: "HOSPITALBASEDATA",
 *   pluralEntityName: "employees",
 *   keyPropertyType: "number", //"string", "number" or "guid"
 *   keyPropertyValue: 3
 * }, {
 *   onResponse: (response) => response.status === 204 ? "Entity does not exist." : "Entity was deleted."
 * });
 *
 * console.log(responseMessage); // Entity does not exist.
 * ```
 *
 * @category Entity
 */
export async function deleteBoEntity(context: DvelopContext, params: DeleteBoEntityParams): Promise<void>;
export async function deleteBoEntity<T>(context: DvelopContext, params: DeleteBoEntityParams, options: DvelopOptions<T>): Promise<T>;
export async function deleteBoEntity<T>(
  context: DvelopContext,
  params: DeleteBoEntityParams,
  options: DvelopOptions<T | void> = {
    onResponse: onResponse
  }
): Promise<T | void> {

  let urlEntityKeyValue: string | number;
  if (params.keyPropertyType === "number" || params.keyPropertyType === "guid") {
    urlEntityKeyValue = params.keyPropertyValue;
  } else {
    urlEntityKeyValue = `'${params.keyPropertyValue}'`;
  }

  return dvelopFetch(context, `/businessobjects/custom/${params.modelName}/${params.pluralEntityName}(${urlEntityKeyValue})`, { method: "DELETE" }, options);
}
