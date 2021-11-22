import { DvelopContext } from "@dvelop-sdk/core";
import { HttpResponse } from "../../utils/http";
import { AuthSession, _getAuthSessionDefaultTransformFunction, _getAuthSessionFactory } from "./get-auth-session";

describe("getAuthSessionFactory", () => {

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

    const getAuthSession = _getAuthSessionFactory(mockHttpRequestFunction, mockTransformFunction);
    await getAuthSession(context);

    expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
    expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
      method: "GET",
      url: "/identityprovider",
      follows: ["login"]
    });
  });

  it("should pass response to transform and return transform-result", async () => {

    const response: HttpResponse = { data: { test: "HiItsMeTest" } } as HttpResponse;
    const transformResult: any = { result: "HiItsMeResult" };
    mockHttpRequestFunction.mockResolvedValue(response);
    mockTransformFunction.mockReturnValue(transformResult);

    const getAuthSession = _getAuthSessionFactory(mockHttpRequestFunction, mockTransformFunction);
    await getAuthSession(context);

    expect(mockTransformFunction).toHaveBeenCalledTimes(1);
    expect(mockTransformFunction).toHaveBeenCalledWith(response, context);
  });

  describe("getAuthSessionDefaultTransformFunction", () => {

    it("should map correctly", async () => {

      const data: any = {
        AuthSessionId: "HiItsMeAuthSessionId",
        Expire: "1992-02-16T16:11:03.8019256Z"
      };

      mockHttpRequestFunction.mockResolvedValue({ data: data } as HttpResponse);

      const getAuthSession = _getAuthSessionFactory(mockHttpRequestFunction, _getAuthSessionDefaultTransformFunction);
      const result: AuthSession = await getAuthSession(context);

      expect(result).toHaveProperty("id", data.AuthSessionId);
      expect(result).toHaveProperty("expire", new Date(data.Expire));
    });
  });
});
