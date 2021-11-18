import { DvelopContext } from "@dvelop-sdk/core";
import { HttpResponse } from "../../utils/http";
import { DeleteTaskParams, _deleteTaskFactory } from "./delete-task";

describe("deleteTaskFactory", () => {

  let mockHttpRequestFunction = jest.fn();
  let mockTransformFunction = jest.fn();

  let context: DvelopContext;
  let params: DeleteTaskParams;

  beforeEach(() => {

    jest.resetAllMocks();

    context = {
      systemBaseUri: "HiItsMeSystemBaseUri"
    };

    params = {
      location: "HiItsMeLocation"
    };
  });

  it("should make correct request", async () => {

    const deleteTask = _deleteTaskFactory(mockHttpRequestFunction, mockTransformFunction);
    await deleteTask(context, params);

    expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
    expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
      method: "DELETE",
      url: params.location
    });
  });

  it("should pass response to transform and return transform-result", async () => {

    const response: HttpResponse = { data: { test: "HiItsMeTest" } } as HttpResponse;
    const transformResult: any = { result: "HiItsMeResult" };
    mockHttpRequestFunction.mockResolvedValue(response);
    mockTransformFunction.mockReturnValue(transformResult);

    const deleteTask = _deleteTaskFactory(mockHttpRequestFunction, mockTransformFunction);
    await deleteTask(context, params);

    expect(mockTransformFunction).toHaveBeenCalledTimes(1);
    expect(mockTransformFunction).toHaveBeenCalledWith(response, context, params);
  });
});