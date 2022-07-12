import { v4 } from "uuid";

/**
 * Generate a unique Version 4 UUID.
 *
 * ```typescript
 * import { generateUuid } from "@dvelop-sdk/core"
 *
 * const uuid: string = generateUuid();
 * console.log(uuid); //ac25ae73-f4b6-477e-a5fa-877c8dea863d
 * ```
 * @category Core
 */
export function generateUuid(): string {
  return v4();
}

/**
 * Generate a unique requestId.
 *
 * ```typescript
 * import { generateRequestId } from "@dvelop-sdk/core"
 *
 * const requestId: string = generateRequestId();
 * console.log(requestId); //ac25ae73-f4b6-477e-a5fa-877c8dea863d
 * ```
 * @category Core
 */
export function generateRequestId(): string {
  return generateUuid();
}
