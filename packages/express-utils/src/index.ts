/**
<div align="center">
  <h1>@dvelop-sdk/express-utils</h1>
  <a href="https://www.npmjs.com/package/@dvelop-sdk/express-utils">
    <img alt="npm (scoped)" src="https://img.shields.io/npm/v/@dvelop-sdk/express-utils?style=for-the-badge">
  </a>
  <a href="https://www.npmjs.com/package/@dvelop-sdk/express-utils">
    <img alt="npm bundle size (scoped)" src="https://img.shields.io/bundlephobia/min/@dvelop-sdk/express-utils?style=for-the-badge">
  </a>
  <a href="https://github.com/d-velop/dvelop-sdk-node">
    <img alt="GitHub" src="https://img.shields.io/badge/GitHub-dvelop--sdk--node-%23ff0844?logo=github&style=for-the-badge">
  </a>
  <a href="https://github.com/d-velop/dvelop-sdk-node/blob/main/LICENSE">
    <img alt="license" src="https://img.shields.io/github/license/d-velop/dvelop-sdk-node?style=for-the-badge">
  </a>
  </br>
  <p>This package contains util-functions for the <a href="https://www.npmjs.com/package/express">express</a>-framework and d.velop app-building.</p>
  <a href="https://d-velop.github.io/dvelop-sdk-node/modules/express-utils.html"><strong>Explore the docs »</strong></a>
  </br>
  <a href="https://www.npmjs.com/package/@dvelop-sdk/express-utils"><strong>Install via npm »</strong></a>
  </br>
  <a href="https://github.com/d-velop/dvelop-sdk-node"><strong>Check us out on GitHub »</strong></a>
</div>
 * @module express-utils
 */
import { DvelopContext } from "@dvelop-sdk/core";
declare global {
  namespace Express {
    interface Request {
      dvelopContext: DvelopContext;
    }
  }
}

export * as internals from "./internal";

// Functions
export { redirectToLoginPage } from "./functions/redirect-to-login-page/redirect-to-login-page";

// Middleware
export { DvelopContext, UnauthorizedError } from "@dvelop-sdk/core";
export { InvalidRequestSignatureError, InvalidCloudCenterEventSignatureError } from "@dvelop-sdk/app-router";
export { contextMiddleware } from "./middleware/dvelop-context-middleware/dvelop-context-middleware";
export { validateSignatureMiddlewareFactory } from "./middleware/dvelop-validate-signature-middleware/dvelop-validate-signature-middleware";
export { authenticationMiddleware } from "./middleware/dvelop-authentication-middleware/dvelop-authentication-middleware";
export { validateCloudCenterEventSignatureMiddlewareFactory } from "./middleware/validate-cloud-center-event-signature-middleware/validate-cloud-center-event-signature-middleware";
