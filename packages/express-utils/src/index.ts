/**
<div align="center">
  <h1>@dvelop-sdk/task</h1>
  <a href="https://www.npmjs.com/package/@dvelop-sdk/task">
    <img alt="npm (scoped)" src="https://img.shields.io/npm/v/@dvelop-sdk/task?style=for-the-badge">
  </a>
  <a href="https://www.npmjs.com/package/@dvelop-sdk/task">
    <img alt="npm bundle size (scoped)" src="https://img.shields.io/bundlephobia/min/@dvelop-sdk/task?style=for-the-badge">
  </a>
  <a href="https://github.com/d-velop/dvelop-sdk-node">
    <img alt="GitHub" src="https://img.shields.io/badge/GitHub-dvelop--sdk--node-%23ff0844?logo=github&style=for-the-badge">
  </a>
  <a href="https://github.com/d-velop/dvelop-sdk-node/blob/master/LICENSE">
    <img alt="license" src="https://img.shields.io/github/license/d-velop/dvelop-sdk-node?style=for-the-badge">
  </a>
  </br>
  <p>This package contains functionality for the <a href="https://developer.d-velop.de/documentation/taskapi/en">Task-App</a> in the d.velop cloud.</p>
  <a href="https://d-velop.github.io/dvelop-sdk-node/modules/task.html"><strong>Explore the docs »</strong></a>
  </br>
  <a href="https://www.npmjs.com/package/@dvelop-sdk/task"><strong>Install via npm »</strong></a>
  </br>
  <a href="https://github.com/d-velop/dvelop-sdk-node"><strong>Check us out on GitHub »</strong></a>
</div>
 * @module task
 */
import { DvelopContext } from "@dvelop-sdk/core";

declare global {
  namespace Express {
    interface Request {
      dvelopContext: DvelopContext
    }
  }
}

export { DvelopContext } from "@dvelop-sdk/core";
export { InvalidRequestSignatureError } from "@dvelop-sdk/app-router";
export { dvelopContextMiddlewareFactory } from "./middleware/dvelop-context-middleware/dvelop-context-middleware";
