import { v4 } from "uuid";

/**
 * Returns a unique Version 4 UUID which can be used as requestId.
 * @category @dvelop-sdk/app-router
 * @returns {string}
 *
 * @example
 * const requestId: string = generateRequestId();
 * console.log(requestId); //ac25ae73-f4b6-477e-a5fa-877c8dea863d
 */
export function generateRequestId(): string {
  return v4();
}
