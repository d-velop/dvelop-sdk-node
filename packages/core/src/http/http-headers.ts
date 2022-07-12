/**
 * HTTP Header for the systemBaseUri for the tenant.
 */
export const DVELOP_SYSTEM_BASE_URI_HEADER = "x-dv-baseuri";

/**
 * HTTP Header for the tenantId for the tenant.
 */
export const DVELOP_TENANT_ID_HEADER = "x-dv-tenant-id";

/**
 * HTTP Header for the requestId for the request. Forward this id to make calls trackable throughout d.velop apps.
 */
export const DVELOP_REQUEST_ID_HEADER = "x-dv-request-id";

/**
 * HTTP Header for the requestSignature. **The requestSignature should be validated for every request when recieving calls from the d.velop cloud.
 * Refer to the [d.velop basics tenant header section](https://developer.d-velop.de/dev/en/basics#tenant-header) for more information.**
 */
export const DVELOP_REQUEST_SIGNATURE_HEADER = "x-dv-sig-1";

/**
 * HTTP Header used for [W3C Trace Context specification](https://www.w3.org/TR/trace-context/#traceparent-header).
 */
export const TRACEPARENT_HEADER = "traceparent";
