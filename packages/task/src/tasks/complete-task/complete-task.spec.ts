import { DvelopContext } from "@dvelop-sdk/core";
import { HttpResponse, TaskError } from "../../utils/http";
import { CompleteTaskParams, _completeTaskFactory } from "./complete-task";

describe("completeTaskFactory", () => {

  let mockHttpRequestFunction = jest.fn();
  let mockTransformFunction = jest.fn();

  let context: DvelopContext;
  let params: CompleteTaskParams;

  beforeEach(() => {

    jest.resetAllMocks();

    context = {
      systemBaseUri: "HiItsMeSystemBaseUri"
    };

    params = {
      location: "/task/tasks/HiItsMeLocation"
    };
  });

  it("should make correct request", async () => {

    const completeTask = _completeTaskFactory(mockHttpRequestFunction, mockTransformFunction);
    await completeTask(context, params);

    expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
    expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
      method: "POST",
      url: "/task/tasks/HiItsMeLocation/completionState",
      data: {
        complete: true
      }
    });
  });

  it("should pass response to transform and return transform-result", async () => {

    const response: HttpResponse = { data: { test: "HiItsMeTest" } } as HttpResponse;
    const transformResult: any = { result: "HiItsMeResult" };
    mockHttpRequestFunction.mockResolvedValue(response);
    mockTransformFunction.mockReturnValue(transformResult);

    const completeTask = _completeTaskFactory(mockHttpRequestFunction, mockTransformFunction);
    await completeTask(context, params);

    expect(mockTransformFunction).toHaveBeenCalledTimes(1);
    expect(mockTransformFunction).toHaveBeenCalledWith(response, context, params);
  });

  it("invalid location should throw an error", async () => {
    const completeTask = _completeTaskFactory(mockHttpRequestFunction, mockTransformFunction);
    await expect(() => completeTask(context, {
      location: "/some/faulty/location"
    })).rejects.toThrow(TaskError);
  });

  it("should work with location with request parameters", async () => {

    const completeTask = _completeTaskFactory(mockHttpRequestFunction, mockTransformFunction);
    await completeTask(context, {
      location: "/task/tasks/HiItsMeLocation?foo=bar&baz=foo"
    });

    expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
    expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
      method: "POST",
      url: "/task/tasks/HiItsMeLocation/completionState",
      data: {
        complete: true
      }
    });
  });
});