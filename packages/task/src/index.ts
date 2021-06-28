/**
 * <div align="center">

    <h1>@dvelop-sdk/task</h1>

    <img alt="npm (scoped)" src="https://img.shields.io/npm/v/@dvelop-sdk/task?style=for-the-badge">

    <img alt="GitHub" src="https://img.shields.io/badge/GitHub-dvelop--sdk--node-%23ff0844?logo=github&style=for-the-badge">

    <img alt="license" src="https://img.shields.io/github/license/d-velop/dvelop-sdk-node?style=for-the-badge">

    </br>

    <p>This package contains functionality for the <a href="https://developer.d-velop.de/documentation/taskapp/en">Task-App</a> in the d.velop cloud.</p>

    <a href="https://d-velop.github.io/dvelop-sdk-node/modules/task.html"><strong>Explore the docs »</strong></a>
    </br>
    <a href="https://www.npmjs.com/package/@dvelop-sdk/task"><strong>Install via npm »</strong></a>
    </br>
    <a href="https://github.com/d-velop/dvelop-sdk-node"><strong>Check us out on GitHub »</strong></a>

 * </div>
 * @module task
 */
export { Task, TaskContext, TaskMetaData, TaskLinks } from "./task";
export { InvalidTaskError, UnauthenticatedError, UnauthorizedError, NoTaskLocationError, TaskNotFoundError, TaskAlreadyCompletedError } from "./errors";
export { createTask } from "./create-task/create-task";
export { completeTask } from "./complete-task/complete-task";
export { deleteTask } from "./delete-task/delete-task";
export { updateTask } from "./update-task/update-task";