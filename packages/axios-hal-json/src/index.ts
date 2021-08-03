/**
<div align="center">
  <h1>@dvelop-sdk/axios-hal-json</h1>
  <img alt="npm (scoped)" src="https://img.shields.io/npm/v/@dvelop-sdk/axios-hal-json?style=for-the-badge">
  <img alt="npm bundle size (scoped)" src="https://img.shields.io/bundlephobia/min/@dvelop-sdk/axios-hal-json?style=for-the-badge">
  <img alt="GitHub" src="https://img.shields.io/badge/GitHub-dvelop--sdk--node-%23ff0844?logo=github&style=for-the-badge">
  <img alt="license" src="https://img.shields.io/github/license/d-velop/dvelop-sdk-node?style=for-the-badge">
  </br>
  <p>This package is an extensions for <a href="https://github.com/axios/axios">axios</a> to follow links according to <a href="https://stateless.group/hal_specification.html">Hypertext Application Language (hal-json). Hal-Json is widely used in the d.velop cloud.</a></p>
  <a href="https://d-velop.github.io/dvelop-sdk-node/modules/axios-hal-json.html"><strong>Explore the docs »</strong></a>
  </br>
  <a href="https://www.npmjs.com/package/@dvelop-sdk/axios-hal-json"><strong>Install via npm »</strong></a>
  </br>
  <a href="https://github.com/d-velop/dvelop-sdk-node"><strong>Check us out on GitHub »</strong></a>
</div>
 * @module axios-hal-json
 */

declare module "axios" {
  // eslint-disable-next-line no-unused-vars
  interface AxiosRequestConfig {
    follows?: string[];
    templates?: { [key: string]: string }
  }
}

export { HalJsonRequestChainError, NoHalJsonLinksInResponseError, NoHalJsonLinkToFollowError, NoHalJsonTemplateValueError} from "./errors";
export { followHalJson } from "./followHalJson/follow-hal-json";
