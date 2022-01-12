/**
<div align="center">
  <h1>@dvelop-sdk/identityprovider</h1>
  <a href="https://www.npmjs.com/package/@dvelop-sdk/identityprovider">
    <img alt="npm (scoped)" src="https://img.shields.io/npm/v/@dvelop-sdk/identityprovider?style=for-the-badge">
  </a>
  <a href="https://www.npmjs.com/package/@dvelop-sdk/identityprovider">
    <img alt="npm bundle size (scoped)" src="https://img.shields.io/bundlephobia/min/@dvelop-sdk/identityprovider?style=for-the-badge">
  </a>
  <a href="https://github.com/d-velop/dvelop-sdk-node">
    <img alt="GitHub" src="https://img.shields.io/badge/GitHub-dvelop--sdk--node-%23ff0844?logo=github&style=for-the-badge">
  </a>
  <a href="https://github.com/d-velop/dvelop-sdk-node/blob/master/LICENSE">
    <img alt="license" src="https://img.shields.io/github/license/d-velop/dvelop-sdk-node?style=for-the-badge">
  </a
  </br>
  <p>This package contains functionality for the <a href="https://developer.d-velop.de/documentation/idpapi/en">Identityprovider-App</a> in the d.velop cloud.</p>
  <a href="https://d-velop.github.io/dvelop-sdk-node/modules/identityprovider.html"><strong>Explore the docs »</strong></a>
  </br>
  <a href="https://www.npmjs.com/package/@dvelop-sdk/identityprovider"><strong>Install via npm »</strong></a>
  </br>
  <a href="https://github.com/d-velop/dvelop-sdk-node"><strong>Check us out on GitHub »</strong></a>
</div>
 * @module identityprovider
 */
import { DvelopUser } from "./authentication/validate-auth-session-id/validate-auth-session-id";

declare module "@dvelop-sdk/core" {
  interface DvelopContext {
    user?: DvelopUser
  }
}

// Utils
export { DvelopContext, BadInputError, UnauthorizedError, ForbiddenError, NotFoundError } from "@dvelop-sdk/core";
export { IdentityproviderError } from "./utils/http";
export * as internals from "./internal";

// Authentication
export { getAuthSession } from "./authentication/get-auth-session/get-auth-session";
export { GetImpersonatedAuthSessionIdParams, getImpersonatedAuthSessionId } from "./authentication/get-impersonated-auth-session-id/get-impersonated-auth-session-id";
export { RequestAppSessionParams, requestAppSession, AppSession } from "./authentication/request-app-session/request-app-session";
export { getLoginRedirectionUri } from "./authentication/get-login-redirection-uri/get-login-redirection-uri";
export { validateAppSessionSignature, InvalidAppSessionSignatureError } from "./authentication/validate-app-session-signature/validate-app-session-signature";
export { validateAuthSessionId, DvelopUser } from "./authentication/validate-auth-session-id/validate-auth-session-id";
