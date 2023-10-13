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
  <a href="https://github.com/d-velop/dvelop-sdk-node/blob/main/LICENSE">
    <img alt="license" src="https://img.shields.io/github/license/d-velop/dvelop-sdk-node?style=for-the-badge">
  </a
  </br>
  <p>This package contains functionality for the <a href="https://developer.d-velop.de/documentation/dmsap/en/">DMS-App</a> in the d.velop cloud.</p>
  <a href="https://d-velop.github.io/dvelop-sdk-node/modules/dms.html"><strong>Explore the docs »</strong></a>
  </br>
  <a href="https://www.npmjs.com/package/@dvelop-sdk/dms"><strong>Install via npm »</strong></a>
  </br>
  <a href="https://github.com/d-velop/dvelop-sdk-node"><strong>Check us out on GitHub »</strong></a>
</div>
 * @module dms
 */

// Utils
export { DvelopContext, BadInputError, UnauthorizedError, ForbiddenError, NotFoundError } from "@dvelop-sdk/core";
export { DmsError } from "./utils/http";
export * as internals from "./internal";

// Repository
export { GetRepositoryParams, Repository, getRepository } from "./repositories/get-repository/get-repository";
export { getRepositories } from "./repositories/get-repositories/get-repositories";

// DmsObjects
export { GetDmsObjectParams, DmsObject, getDmsObject } from "./dms-objects/get-dms-object/get-dms-object";
export { getDmsObjectMainFile, getDmsObjectPdfFile } from "./dms-objects/get-dms-object-file/get-dms-object-file";
export { GetDmsObjectNotesParams, DmsObjectNotes, SingleDmsObjectNote, getDmsObjectNotes } from "./dms-objects/get-dms-object-notes/get-dms-object-notes";
export { CreateDmsObjectParams, createDmsObject } from "./dms-objects/create-dms-object/create-dms-object";
export { CreateDmsObjectNoteParams, createDmsObjectNote as createDmsObjectNotes } from "./dms-objects/create-dms-object-note/create-dms-object-note";
export { StoreFileTemporarilyParams, storeFileTemporarily } from "./dms-objects/store-file-temporarily/store-file-temporarily";
export { UpdateDmsObjectParams, updateDmsObject } from "./dms-objects/update-dms-object/update-dms-object";
export { UpdateDmsObjectStatusParams, updateDmsObjectStatus } from "./dms-objects/update-dms-object-status/update-dms-object-status";
export { DeleteCurrentDmsObjectVersionParams, deleteCurrentDmsObjectVersion } from "./dms-objects/delete-current-dms-object-version/delete-current-dms-object-version";
export { SearchDmsObjectsParams, SearchDmsObjectsResultPage, ListedDmsObject, searchDmsObjects } from "./dms-objects/search-dms-objects/search-dms-objects";
export { ReleaseAndUpdateDmsObjectError, releaseAndUpdateDmsObject } from "./dms-objects/release-and-update-dms-objects/release-and-update-dms-objects";
export { LinkDmsObjectsParams, linkDmsObjects } from "./dms-objects/link-dms-objects/link-dms-objects";
export { UnlinkDmsObjectsParams, unlinkDmsObjects } from "./dms-objects/unlink-dms-objects/unlink-dms-objects";

// Mappings
export { GetMappingsParams, getMappings } from "./mapping/get-mappings/get-mappings";
