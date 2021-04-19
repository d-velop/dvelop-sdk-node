/**
 * <div style="text-align: center">
    <img alt="GitHub" src="https://img.shields.io/badge/GitHub-dvelop--sdk--node-%23ff0844?logo=github&style=flat-square">
    <img alt="npm" src="https://img.shields.io/npm/v/@dvelop-sdk/app-router?style=flat-square&logo=npm&style=flat-square">
    <img alt="npm bundle size" src="https://img.shields.io/bundlephobia/min/@dvelop-sdk/app-router?style=flat-square">
    <img alt="GitHub" src="https://img.shields.io/github/license/d-velop/dvelop-sdk-node?style=flat-square">
    </br>
    <h2>@dvelop-sdk/app-router</h2>
    <p>This package contains functionality for the <a href="https://developer.d-velop.de/dev/en/basics">App-Router</a> in the d.velop cloud.</p>
    <a href="https://d-velop.github.io/dvelop-sdk-node/modules/app_router.html"><strong>Explore the docs »</strong></a>
    </br>
    <a href=""><strong>Install via npm »</strong></a>
    </br>
    <a href="https://github.com/d-velop/dvelop-sdk-node"><strong>Check us out on GitHub »</strong></a>
  </div>
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
export const DVELOP_REQUEST_ID_HEADER = "x-dv-request-id";

/**
 * HTTP Header-Name for the requestSignature for the request. **The requestSignature should be validated for every request when recieving calls from the d.velop cloud.
 * Refer to the [d.velop basics tenant header section](https://developer.d-velop.de/dev/en/basics#tenant-header) for more information.**
 */
export const DVELOP_REQUEST_SIGNATURE_HEADER = "x-dv-sig-1";


export const tmpTest = "This is a test";

export { generateRequestId } from "./generate-request-id/generate-request-id";
export { validateRequestSignature } from "./validate-request-signature/validate-request-signature";