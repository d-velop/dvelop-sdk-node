import { DvelopContext, dvelopFetch } from "@dvelop-sdk/core";
import { CompleteTaskParams, onResponse, completeTask } from "./complete-task";
import { TaskError } from "../../utils/task-error";

jest.mock("@dvelop-sdk/core", () => {
  const actual = jest.requireActual("@dvelop-sdk/core");
  return { ...actual, dvelopFetch: jest.fn() };
});

const mockDvelopFetch = dvelopFetch as jest.MockedFunction<typeof dvelopFetch>;

describe("completeTask", () => {

  let context: DvelopContext;
  let params: CompleteTaskParams;

  beforeEach(() => {
    jest.resetAllMocks();
    context = { systemBaseUri: "HiItsMeSystemBaseUri" };
    params = { location: "/task/tasks/HiItsMeLocation" };
  });

  it("should call dvelopFetch with method POST and completion body", async () => {
    await completeTask(context, params);

    expect(mockDvelopFetch).toHaveBeenCalledTimes(1);
    const [calledContext, calledUrl, calledInit, calledOptions] = mockDvelopFetch.mock.calls[0];
    expect(calledContext).toBe(context);
    expect(calledUrl).toBe("/task/tasks/HiItsMeLocation/completionState");
    expect(calledInit).toMatchObject({ method: "POST" });
    expect(JSON.parse(calledInit!.body as string)).toEqual({ complete: true });
    expect(calledOptions).toMatchObject({ onResponse: onResponse });
  });

  it("should work with location with request parameters", async () => {
    await completeTask(context, { location: "/task/tasks/HiItsMeLocation?foo=bar&baz=foo" });

    expect(mockDvelopFetch).toHaveBeenCalledTimes(1);
    expect(mockDvelopFetch.mock.calls[0][1]).toBe("/task/tasks/HiItsMeLocation/completionState");
  });

  it("should throw TaskError on invalid location", async () => {
    await expect(() => completeTask(context, { location: "/some/faulty/location" })).rejects.toThrow(TaskError);
    expect(mockDvelopFetch).not.toHaveBeenCalled();
  });

  it("should forward caller-supplied options", async () => {
    const options = { onResponse: jest.fn() };
    await completeTask(context, params, options);
    expect(mockDvelopFetch.mock.calls[0][3]).toBe(options);
  });

  describe("onResponse", () => {

    it("should resolve on success", async () => {
      const response = new Response(null, { status: 200 });
      await expect(onResponse(response)).resolves.toBeUndefined();
    });
  });
});
