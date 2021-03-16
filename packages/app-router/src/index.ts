/**
 * This module contains functionality for the App-Router in the d.velop cloud.
 * @module app-router
 */

/**
 * HTTP Header-Name for the systemBaseUri for the tenant.
 */
export const DVELOP_SYSTEM_BASE_URI_HEADER = "x-dv-baseuri";

/**
 * HTTP Header-Name for the tenantId for the tenant.
 */
export const DVELOP_TENANT_ID_HEADER = "x-dv-tenant-id";

/**
 * HTTP Header-Name for the requestId for the request. Forward this id to make calls trackable throughout d.velop apps.
 */
export const DVELOP_REQUEST_ID_HEADER = "x-dv-sig-1";

/**
 * HTTP Header-Name for the requestSignature for the request. **The requestSignature should be validated for every request when recieving calls from the d.velop cloud.
 * Refer to the [d.velop basics tenant header section](https://developer.d-velop.de/dev/en/basics#tenant-header) for more information.**
 */
export const DVELOP_REQUEST_SIGNATURE_HEADER = "x-dv-request-id";

export { generateRequestId } from "./generate-request-id/generate-request-id";
export { validateRequestSignature } from "./validate-request-signature/validate-request-signature";