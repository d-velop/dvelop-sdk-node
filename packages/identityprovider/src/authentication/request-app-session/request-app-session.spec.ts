import { DvelopContext } from "@dvelop-sdk/core";
import { HttpResponse } from "../../utils/http";
import { RequestAppSessionParams, _requestAppSessionFactory } from "./request-app-session";

describe("requestAppSessionFactory", () => {

  let mockHttpRequestFunction = jest.fn();
  let mockTransformFunction = jest.fn();

  let context: DvelopContext;
  let params: RequestAppSessionParams;

  beforeEach(() => {

    jest.resetAllMocks();

    context = {
      systemBaseUri: "HiItsMeSystemBaseUri",
      requestId: "HiItsMeRequestId"
    };

    params = {
      appName: "HiItsMeAppName",
      callback: "HiItsMeCallBack"
    };
  });

  it("should make correct request", async () => {

    const requestAppSession = _requestAppSessionFactory(mockHttpRequestFunction, mockTransformFunction);
    await requestAppSession(context, params);

    expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
    expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
      method: "POST",
      url: "/identityprovider/appsession",
      data: {
        appname: params.appName,
        callback: params.callback,
        requestid: context.requestId
      }
    });
  });

  it("should pass response to transform and return transform-result", async () => {

    const response: HttpResponse = { data: { test: "HiItsMeTest" } } as HttpResponse;
    const transformResult: any = { result: "HiItsMeResult" };
    mockHttpRequestFunction.mockResolvedValue(response);
    mockTransformFunction.mockReturnValue(transformResult);

    const requestAppSession = _requestAppSessionFactory(mockHttpRequestFunction, mockTransformFunction);
    await requestAppSession(context, params);

    expect(mockTransformFunction).toHaveBeenCalledTimes(1);
    expect(mockTransformFunction).toHaveBeenCalledWith(response, context, params);
  });
});