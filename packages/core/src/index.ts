/**
<div align="center">
  <h1>@dvelop-sdk/core</h1>
  <a href="https://www.npmjs.com/package/@dvelop-sdk/core">
    <img alt="npm (scoped)" src="https://img.shields.io/npm/v/@dvelop-sdk/core?style=for-the-badge">
  </a>
  <a href="https://www.npmjs.com/package/@dvelop-sdk/core">
    <img alt="npm bundle size (scoped)" src="https://img.shields.io/bundlephobia/min/@dvelop-sdk/core?style=for-the-badge">
  </a>
  <a href="https://github.com/d-velop/dvelop-sdk-node">
    <img alt="GitHub" src="https://img.shields.io/badge/GitHub-dvelop--sdk--node-%23ff0844?logo=github&style=for-the-badge">
  </a>
  <a href="https://github.com/d-velop/dvelop-sdk-node/blob/master/LICENSE">
    <img alt="license" src="https://img.shields.io/github/license/d-velop/dvelop-sdk-node?style=for-the-badge">
  </a>
  </br>
  <p>This package contains shared functionality for the @dvelop-sdk packages.</p>
  <a href="https://d-velop.github.io/dvelop-sdk-node/modules/core.html"><strong>Explore the docs »</strong></a>
  </br>
  <a href="https://www.npmjs.com/package/@dvelop-sdk/core"><strong>Install via npm »</strong></a>
  </br>
  <a href="https://github.com/d-velop/dvelop-sdk-node"><strong>Check us out on GitHub »</strong></a>
</div>
 * @module core
 */
export { DvelopContext } from "./context/context";
export * from "./errors/errors";
export * from "./http/http-headers";
export { DeepMergeError, deepMergeObjects } from "./util/deep-merge-objects";
export { DvelopHttpRequestConfig, HttpResponse as DvelopHttpResponse, DvelopHttpError, DvelopHttpClient, defaultDvelopHttpClientFactory } from "./http/http-client";
export { generateUuid, generateRequestId } from "./generate-uuid/generate-uudi-id";
export { TraceContext, parseTraceparentHeader, buildTraceparentHeader, generateTraceId, generateSpanId } from "./tracecontext/traceparent";
