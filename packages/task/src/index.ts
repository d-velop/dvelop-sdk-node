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
  <a href="https://github.com/d-velop/dvelop-sdk-node/blob/main/LICENSE">
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
export { DvelopContext, BadInputError, UnauthorizedError, ForbiddenError, NotFoundError } from "@dvelop-sdk/core";
export { TaskValidation, InvalidTaskDefinitionError, TaskError } from "./utils/http";
export * as internals from "./internal";

export { CreateTaskParams, createTask } from "./tasks/create-task/create-task";
export { CompleteTaskParams, completeTask } from "./tasks/complete-task/complete-task";
export { DeleteTaskParams, deleteTask } from "./tasks/delete-task/delete-task";
export { getTaskCount } from "./tasks/get-task-count/get-task-count";
export { UpdateTaskParams, updateTask } from "./tasks/update-task/update-task";