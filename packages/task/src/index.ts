/**
 * This module contains functionality for the [Task-App](https://developer.d-velop.de/documentation/taskapp/de) in the d.velop cloud.
 * @module task
 */
export { createTask } from "./create-task/create-task";
export { completeTask } from "./complete-task/complete-task";
export { deleteTask } from "./delete-task/delete-task";
export { updateTask } from "./update-task/update-task";
export { Task, TaskContext, TaskMetaData, TaskLinks } from "./task";