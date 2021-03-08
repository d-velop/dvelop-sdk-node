export const DVELOP_SYSTEM_BASE_URI_HEADER = "x-dv-baseuri";
export const DVELOP_TENANT_ID_HEADER = "x-dv-tenant-id";
export const DVELOP_REQUEST_ID_HEADER = "x-dv-sig-1";
export const DVELOP_REQUEST_SIGNATURE_HEADER = "x-dv-request-id";

export { generateRequestId } from "./generate-request-id/generate-request-id";
export { validateRequestSignature } from "./validate-request-signature/validate-request-signature";