import { DvelopContext } from "@dvelop-sdk/core";
import { HttpResponse } from "../../utils/http";
import { _getTaskCountDefaultTransformFunction, _getTaskCountFactory } from "./get-task-count";

describe("getTaskCountFactory", () => {

  let mockHttpRequestFunction = jest.fn();
  let mockTransformFunction = jest.fn();

  let context: DvelopContext;

  beforeEach(() => {

    jest.resetAllMocks();

    context = {
      systemBaseUri: "HiItsMeSystemBaseUri"
    };
  });

  it("should make correct request", async () => {

    const getTaskCount = _getTaskCountFactory(mockHttpRequestFunction, mockTransformFunction);
    await getTaskCount(context);

    expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
    expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
      method: "GET",
      url: "/task/count/all"
    });
  });

  it("should pass response to transform and return transform-result", async () => {

    const response: HttpResponse = { data: { test: "HiItsMeTest" } } as HttpResponse;
    const transformResult: any = { result: "HiItsMeResult" };
    mockHttpRequestFunction.mockResolvedValue(response);
    mockTransformFunction.mockReturnValue(transformResult);

    const getTaskCount = _getTaskCountFactory(mockHttpRequestFunction, mockTransformFunction);
    await getTaskCount(context);

    expect(mockTransformFunction).toHaveBeenCalledTimes(1);
    expect(mockTransformFunction).toHaveBeenCalledWith(response, context);
  });

  describe("getTaskCountDefaultTransformFunction", () => {

    it("should map correctly", async () => {

      const data: any = {
        count: 42
      };

      mockHttpRequestFunction.mockResolvedValue({ data: data } as HttpResponse);

      const getTaskCount = _getTaskCountFactory(mockHttpRequestFunction, _getTaskCountDefaultTransformFunction);
      const result: number = await getTaskCount(context);

      expect(result).toEqual(data.count);
    });
  });
});