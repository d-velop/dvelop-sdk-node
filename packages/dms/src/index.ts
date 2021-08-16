/**
<div align="center">
  <h1>@dvelop-sdk/dms</h1>
  <a href="https://www.npmjs.com/package/@dvelop-sdk/dms">
    <img alt="npm (scoped)" src="https://img.shields.io/npm/v/@dvelop-sdk/dms?style=for-the-badge">
  </a>
  <a href="https://www.npmjs.com/package/@dvelop-sdk/dms">
    <img alt="npm bundle size (scoped)" src="https://img.shields.io/bundlephobia/min/@dvelop-sdk/dms?style=for-the-badge">
  </a>
  <a href="https://github.com/d-velop/dvelop-sdk-node">
    <img alt="GitHub" src="https://img.shields.io/badge/GitHub-dvelop--sdk--node-%23ff0844?logo=github&style=for-the-badge">
  </a>
  <a href="https://github.com/d-velop/dvelop-sdk-node/blob/master/LICENSE">
    <img alt="license" src="https://img.shields.io/github/license/d-velop/dvelop-sdk-node?style=for-the-badge">
  </a
  </br>
  <p>This package contains functionality for the <a href="https://developer.d-velop.de/documentation/dmsap/en/dms-api-126976273.html">DMS-App</a> in the d.velop cloud.</p>
  <a href="https://d-velop.github.io/dvelop-sdk-node/modules/dms.html"><strong>Explore the docs »</strong></a>
  </br>
  <a href="https://www.npmjs.com/package/@dvelop-sdk/dms"><strong>Install via npm »</strong></a>
  </br>
  <a href="https://github.com/d-velop/dvelop-sdk-node"><strong>Check us out on GitHub »</strong></a>
</div>
 * @module dms
 */
import axios from "axios";
import { followHalJson } from "@dvelop-sdk/axios-hal-json";
axios.interceptors.request.use(followHalJson);

// Utils
export { TenantContext } from "./utils/tenant-context";

// Errors
export { BadRequestError, UnauthorizedError, NotFoundError, RepositoryNotFoundError, DmsAppBadRequestError, DmsObjectNotFoundError } from "./utils/errors";

// Repositories
export { getRepositories } from "./repositories/get-repositories/get-repositories";
export { GetRepositoryParams, Repository, getRepository } from "./repositories/get-repository/get-repository";

// DmsObjects
// export { GetDmsObjectParams, DmsObject, getDmsObject } from "./dms-objects/get-dms-object/get-dms-object";
// export { SearchDmsObjectsParams, SearchResultPage, searchDmsObjects } from "./dms-objects/search-dms-objects/search-dms-objects";

export * from "./utils/errors";
export * as internals from "./utils/internals";