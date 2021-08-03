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
  <p>This package contains functionality for the <a href="https://developer.d-velop.de/documentation/idpapi/en/identityprovider-app-201523580.html">Identityprovider-App</a> in the d.velop cloud.</p>
  <a href="https://d-velop.github.io/dvelop-sdk-node/modules/identityprovider.html"><strong>Explore the docs »</strong></a>
  </br>
  <a href="https://www.npmjs.com/package/@dvelop-sdk/identityprovider"><strong>Install via npm »</strong></a>
  </br>
  <a href="https://github.com/d-velop/dvelop-sdk-node"><strong>Check us out on GitHub »</strong></a>
</div>
 * @module identityprovider
 */
import axios from "axios";
import { followHalJson } from "@dvelop-sdk/axios-hal-json";
axios.interceptors.request.use(followHalJson);

export { UnauthorizedError, ForbiddenError, NotFoundError, InvalidAppSessionSignatureError } from "./errors";
export { AuthSession } from "./authentication/get-auth-session/auth-session";
export { getAuthSession } from "./authentication/get-auth-session/get-auth-session";
export { ScimUser } from "./authentication/validate-auth-session-id/scim-user";
export { validateAuthSessionId } from "./authentication/validate-auth-session-id/validate-auth-session-id";
export { getLoginRedirectionUri } from "./authentication/get-login-redirection-uri/get-login-redirection-uri";
export { requestAppSession } from "./authentication/request-app-session/request-app-session";
export { validateAppSessionSignature } from "./authentication/validate-app-session-signature/validate-app-session-signature";
export { getImpersonatedAuthSessionId } from "./authentication/get-impersonated-auth-session-id/get-impersonated-auth-session-id";