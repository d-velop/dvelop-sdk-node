import { DvelopContext } from "@dvelop-sdk/core";
import { HttpResponse } from "../../utils/http";
import { DvelopUser, _validateAuthSessionIdDefaultTransformFunction, _validateAuthSessionIdFactory } from "./validate-auth-session-id";

describe("validateAuthSessionIdFactory", () => {

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

    const validateAuthSessionId = _validateAuthSessionIdFactory(mockHttpRequestFunction, mockTransformFunction);
    await validateAuthSessionId(context);

    expect(mockHttpRequestFunction).toHaveBeenCalledTimes(1);
    expect(mockHttpRequestFunction).toHaveBeenCalledWith(context, {
      method: "GET",
      url: "/identityprovider",
      follows: ["validate"]
    });
  });

  it("should pass response to transform and return transform-result", async () => {

    const response: HttpResponse = { data: { test: "HiItsMeTest" } } as HttpResponse;
    const transformResult: any = { result: "HiItsMeResult" };
    mockHttpRequestFunction.mockResolvedValue(response);
    mockTransformFunction.mockReturnValue(transformResult);

    const validateAuthSessionId = _validateAuthSessionIdFactory(mockHttpRequestFunction, mockTransformFunction);
    await validateAuthSessionId(context);

    expect(mockTransformFunction).toHaveBeenCalledTimes(1);
    expect(mockTransformFunction).toHaveBeenCalledWith(response, context);
  });

  describe("validateAuthSessionIdDefaultTransformFunction", () => {

    it("should map correctly", async () => {

      const data: any = {
        name: {
          familyName: "HiItsMeFamilyName",
          givenName: "HiItsMeGivenName"
        }
      };

      mockHttpRequestFunction.mockResolvedValue({ data: data } as HttpResponse);

      const validateAuthSessionId = _validateAuthSessionIdFactory(mockHttpRequestFunction, _validateAuthSessionIdDefaultTransformFunction);
      const result: DvelopUser = await validateAuthSessionId(context);

      expect(result.name.familyName).toEqual(data.name.familyName);
      expect(result.name.givenName).toEqual(data.name.givenName);
    });
  });
});