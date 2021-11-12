import { DvelopContext } from "@dvelop-sdk/core";
import { HttpResponse } from "../../utils/http";
import { GetImpersonatedAuthSessionIdParams, _getImpersonatedAuthSessionIdDefaultTransformFunction, _getImpersonatedAuthSessionIdFactory } from "./get-impersonated-auth-session-id";

describe("getImpersonatedAuthSessionIdFactory", () => {

  let mockHttpRequestFunction = jest.fn();
  let mockTransformFunction = jest.fn();

  let context: DvelopContext;
  let params: GetImpersonatedAuthSessionIdParams;

  beforeEach(() => {

    jest.resetAllMocks();

    context = {
      systemBaseUri: "HiItsMeSystemBaseUri"
    };

    params = {
      userId: "HiItsMeUserId"
    };
  });

  it("should make correct request", async () => {

    const getImpersonatedAuthSessionId = _getImpersonatedAuthSessionIdFactory(mockHttpRequestFunction, mockTransformFunction);
    await getImpersonatedAuthSessionId(context, params);

    expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
    expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
      method: "GET",
      url: "/identityprovider/impersonatesession",
      params: {
        userId: params.userId
      }
    });
  });

  it("should pass response to transform and return transform-result", async () => {

    const response: HttpResponse = { data: { test: "HiItsMeTest" } } as HttpResponse;
    const transformResult: any = { result: "HiItsMeResult" };
    mockHttpRequestFunction.mockResolvedValue(response);
    mockTransformFunction.mockReturnValue(transformResult);

    const getImpersonatedAuthSessionId = _getImpersonatedAuthSessionIdFactory(mockHttpRequestFunction, mockTransformFunction);
    await getImpersonatedAuthSessionId(context, params);

    expect(mockTransformFunction).toHaveBeenCalledTimes(1);
    expect(mockTransformFunction).toHaveBeenCalledWith(response, context, params);
  });

  describe("getImpersonatedAuthSessionIdDefaultTransformFunction", () => {

    it("should map correctly", async () => {

      const data: any = {
        authSessionId: "HiItsMeAuthSessionId"
      };

      mockHttpRequestFunction.mockResolvedValue({ data: data } as HttpResponse);

      const getImpersonatedAuthSessionId = _getImpersonatedAuthSessionIdFactory(mockHttpRequestFunction, _getImpersonatedAuthSessionIdDefaultTransformFunction);
      const result: string = await getImpersonatedAuthSessionId(context, params);

      expect(result).toEqual(data.authSessionId);
    });
  });
});