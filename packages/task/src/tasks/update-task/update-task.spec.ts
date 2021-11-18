import { DvelopContext } from "@dvelop-sdk/core";
import { HttpResponse } from "../../utils/http";
import { UpdateTaskParams, _updateTaskFactory } from "./update-task";

describe("updateTaskFactory", () => {

  let mockHttpRequestFunction = jest.fn();
  let mockTransformFunction = jest.fn();

  let context: DvelopContext;
  let params: UpdateTaskParams;

  beforeEach(() => {

    jest.resetAllMocks();

    context = {
      systemBaseUri: "HiItsMeSystemBaseUri"
    };

    params = {
      location: "HiItsMeLocation",
      subject: "HiItsMeSubject",
      assignees: ["HiItsMeAssignee1", "HiItsMeAssignee2"]
    };
  });

  it("should make correct request", async () => {

    const updateTask = _updateTaskFactory(mockHttpRequestFunction, mockTransformFunction);
    await updateTask(context, params);

    const expectedData: any = { ...params, ...{ location: null } };

    expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
    expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
      method: "PATCH",
      url: params.location,
      data: expectedData
    });
  });

  it("should parse dueDate", async () => {

    const date: Date = new Date();

    const updateTask = _updateTaskFactory(mockHttpRequestFunction, mockTransformFunction);
    await updateTask(context, { ...params, ...{ dueDate: date } });

    expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
    expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, expect.objectContaining({
      data: expect.objectContaining({
        dueDate: date.toISOString()
      })
    }));
  });

  it("should parse reminderDate", async () => {

    const date: Date = new Date();

    const updateTask = _updateTaskFactory(mockHttpRequestFunction, mockTransformFunction);
    await updateTask(context, { ...params, ...{ reminderDate: date } });

    expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
    expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, expect.objectContaining({
      data: expect.objectContaining({
        reminderDate: date.toISOString()
      })
    }));
  });


  it("should pass response to transform and return transform-result", async () => {

    const response: HttpResponse = { data: { test: "HiItsMeTest" } } as HttpResponse;
    const transformResult: any = { result: "HiItsMeResult" };
    mockHttpRequestFunction.mockResolvedValue(response);
    mockTransformFunction.mockReturnValue(transformResult);

    const updateTask = _updateTaskFactory(mockHttpRequestFunction, mockTransformFunction);
    await updateTask(context, params);

    expect(mockTransformFunction).toHaveBeenCalledTimes(1);
    expect(mockTransformFunction).toHaveBeenCalledWith(response, context, params);
  });
});