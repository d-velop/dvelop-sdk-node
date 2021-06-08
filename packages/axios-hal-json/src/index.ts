/**
 * <div align="center">

    <h1>@dvelop-sdk/app-router</h1>

    <img alt="npm (scoped)" src="https://img.shields.io/npm/v/@dvelop-sdk/axios-hal-json?style=for-the-badge">

    <img alt="npm bundle size (scoped)" src="https://img.shields.io/bundlephobia/min/@dvelop-sdk/axios-hal-json?style=for-the-badge">

    <img alt="GitHub" src="https://img.shields.io/badge/GitHub-dvelop--sdk--node-%23ff0844?logo=github&style=for-the-badge">

    <img alt="license" src="https://img.shields.io/github/license/d-velop/dvelop-sdk-node?style=for-the-badge">

    </br>

    <p>This package contains functionality for the <a href="https://developer.d-velop.de/dev/en/basics">App-Router</a> in the d.velop cloud.</p>

    <a href="https://d-velop.github.io/dvelop-sdk-node/modules/axios-hal-json.html"><strong>Explore the docs »</strong></a>
    </br>
    <a href="https://www.npmjs.com/package/@dvelop-sdk/axios-hal-json"><strong>Install via npm »</strong></a>
    </br>
    <a href="https://github.com/d-velop/dvelop-sdk-node"><strong>Check us out on GitHub »</strong></a>

 * </div >
 * @module axios-hal-json
 */

declare module "axios" {
  // eslint-disable-next-line no-unused-vars
  interface AxiosRequestConfig {
    follows?: string[];
    templates?: { [key: string]: string }
  }
}

export { followHalJson, HalJsonRequestChainError, NoHalJsonLinksInResponseError, NoHalJsonLinkToFollowError, NoHalJsonTemplateValueError } from "./followHalJson/follow-hal-json";