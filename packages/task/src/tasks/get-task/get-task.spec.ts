import { DvelopContext, dvelopFetch } from "@dvelop-sdk/core";
import { GetTaskParams, Task, onResponse, getTask } from "./get-task";

jest.mock("@dvelop-sdk/core", () => {
  const actual = jest.requireActual("@dvelop-sdk/core");
  return { ...actual, dvelopFetch: jest.fn() };
});

const mockDvelopFetch = dvelopFetch as jest.MockedFunction<typeof dvelopFetch>;

describe("getTask", () => {

  let context: DvelopContext;
  let params: GetTaskParams;

  beforeEach(() => {
    jest.resetAllMocks();
    context = { systemBaseUri: "someBaseUri" };
    params = { taskId: "SomeTestId" };
  });

  it("should call dvelopFetch with method GET", async () => {
    await getTask(context, params);

    expect(mockDvelopFetch).toHaveBeenCalledTimes(1);
    expect(mockDvelopFetch).toHaveBeenCalledWith(
      context,
      "/task/tasks/SomeTestId",
      { method: "GET" },
      expect.objectContaining({ onResponse: onResponse })
    );
  });

  it("should forward caller-supplied options", async () => {
    const options = { onResponse: jest.fn() };
    await getTask(context, params, options);
    expect(mockDvelopFetch.mock.calls[0][3]).toBe(options);
  });

  describe("onResponse", () => {

    function jsonResponse(data: any): Response {
      return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    it("should map and transform date values", async () => {
      const response = jsonResponse({
        id: "SomeTestId",
        subject: "My subject",
        assignees: ["bob"],
        sender: "alice",
        receiveDate: "2024-07-28T12:12:12.000Z",
        dueDate: "2025-01-01T12:00:00.000Z",
        reminderDate: "2026-01-01T12:00:00.000Z",
        completionDate: "2027-01-01T12:00:00.000Z"
      });

      const task: Task = await onResponse(response);

      expect(task.id).toBe("SomeTestId");
      expect(task.subject).toBe("My subject");
      expect(task.assignees).toEqual(["bob"]);
      expect(task.sender).toBe("alice");
      expect(task.receiveDate).toEqual(new Date("2024-07-28T12:12:12.000Z"));
      expect(task.dueDate).toEqual(new Date("2025-01-01T12:00:00.000Z"));
      expect(task.reminderDate).toEqual(new Date("2026-01-01T12:00:00.000Z"));
      expect(task.completionDate).toEqual(new Date("2027-01-01T12:00:00.000Z"));
    });
  });
});
