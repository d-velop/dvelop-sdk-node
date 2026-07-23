/**
 * Live end-to-end tests for the Task-App against a real tenant.
 *
 * Run with `npm run test:e2e` (never part of `npm test`). Requires
 * `DVELOP_E2E_SYSTEM_BASE_URI` + `DVELOP_E2E_API_KEY`; self-skips otherwise.
 * See `CONTRIBUTING.md` for details.
 *
 * Isolation: every task is tagged with a unique run marker. Cleanup: each
 * created task is deleted in `afterAll` (best-effort, never throws).
 */
import {
  createTask,
  getTask,
  updateTask,
  completeTask,
  deleteTask,
  searchTasks,
  getTaskCount
} from "@dvelop-sdk/task";
import { DvelopContext } from "@dvelop-sdk/core";
import { bootstrapE2e, readE2eEnv } from "../helpers/context.js";

/** Extracts the task id (last path segment) from a task location-URI. */
function taskIdFromLocation(location: string): string {
  return location.split("/").filter(Boolean).pop() ?? "";
}

const env = readE2eEnv();
const describeE2e = env ? describe : describe.skip;

describeE2e("task e2e", () => {

  let context: DvelopContext;
  let marker: string;
  let assigneeId: string;
  const createdLocations: string[] = [];

  beforeAll(async () => {
    const bootstrap = await bootstrapE2e(env!);
    context = bootstrap.context;
    marker = bootstrap.marker;
    if (!bootstrap.user.id) {
      throw new Error("e2e bootstrap: authenticated user has no id to assign tasks to");
    }
    assigneeId = bootstrap.user.id;
  });

  afterAll(async () => {
    for (const location of createdLocations) {
      try {
        await deleteTask(context, { location });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn(`e2e cleanup: failed to delete task '${location}':`, error);
      }
    }
  });

  test("getTaskCount returns a number", async () => {
    const count = await getTaskCount(context);
    expect(typeof count).toBe("number");
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("full task lifecycle: create, read, update, search, complete", async () => {
    // Create
    const location = await createTask(context, {
      subject: `${marker} subject`,
      assignees: [assigneeId]
    });
    expect(location).toBeTruthy();
    createdLocations.push(location);

    // Read
    const created = await getTask(context, { taskId: taskIdFromLocation(location) });
    expect(created.subject).toBe(`${marker} subject`);

    // Update
    await updateTask(context, { location, subject: `${marker} updated` });
    const updated = await getTask(context, { taskId: taskIdFromLocation(location) });
    expect(updated.subject).toBe(`${marker} updated`);

    // Search — the created task is findable
    const page = await searchTasks(context, { pageSize: 100 });
    const found = page.tasks.some(t => t.subject === `${marker} updated`);
    expect(found).toBe(true);

    // Complete
    await expect(completeTask(context, { location })).resolves.not.toThrow();
  });
});
