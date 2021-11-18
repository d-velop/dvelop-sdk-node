import { v4 } from "uuid";

/**
 * Generate a unique Version 4 UUID.
 * @returns {string}
 *
 * @example ```typescript
 * const uuid: string = generateUuid();
 * console.log(uuid); //ac25ae73-f4b6-477e-a5fa-877c8dea863d
 * ```
 */
export function generateUuid(): string {
  return v4();
}

/**
 * Generate a unique requestId.
 * @returns {string}
 *
 * @example ```typescript
 * const requestId: string = generateRequestId();
 * console.log(requestId); //ac25ae73-f4b6-477e-a5fa-877c8dea863d
 * ```
 */
export function generateRequestId(): string {
  return generateUuid();
}
