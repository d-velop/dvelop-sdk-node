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
export { Context } from "./utils/context";
export * from "./utils/errors";
export * as internal from "./internals";

// Repository
export { GetRepositoryParams, Repository, getRepository } from "./repositories/get-repository/get-repository";
export { getRepositories } from "./repositories/get-repositories/get-repositories";

// DmsObjects
export { GetDmsObjectParams, DmsObject, getDmsObject } from "./dms-objects/get-dms-object/get-dms-object";
export { getDmsObjectMainFile, getDmsObjectPdfFile } from "./dms-objects/get-dms-object-file/get-dms-object-file";
export { CreateDmsObjectParams, createDmsObject } from "./dms-objects/create-dms-object/create-dms-object";
export { UpdateDmsObjectParams, updateDmsObject } from "./dms-objects/update-dms-object/update-dms-object";
export { DeleteCurrentDmsObjectVersionParams, deleteCurrentDmsObjectVersion } from "./dms-objects/delete-current-dms-object-version/delete-current-dms-object-version";

