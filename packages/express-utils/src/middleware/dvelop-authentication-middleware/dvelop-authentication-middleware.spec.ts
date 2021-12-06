import "../../index";
import { NextFunction, Request, Response } from "express";
import { DvelopContext } from "@dvelop-sdk/core";
import { DvelopUser } from "@dvelop-sdk/identityprovider";
import { _dvelopAuthenticationMiddlewareFactory, _getAuthSessionIdFromRequestDefaultFunction } from "./dvelop-authentication-middleware";

describe("dvelopContextMiddlewareFactory", () => {

  let mockGetAuthSessionId = jest.fn();
  let mockValidateAuthSessionId = jest.fn();
  let mockRequest: Request;
  let mockResponse: Response;
  let mockNextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    mockRequest = {
      get: jest.fn(),
      cookies: {}
    } as unknown as Request;
    mockResponse = {} as unknown as Response;
  });

  it("should use authSessionId from context", async () => {

    const context: DvelopContext = {
      authSessionId: "HiItsMeAuthSessionId"
    };
    mockRequest.dvelopContext = context;

    const user: DvelopUser = {
      displayName: "HiItsMeUser"
    };
    mockValidateAuthSessionId.mockResolvedValueOnce(user);

    const dvelopAuthenticationMiddleware: Function = _dvelopAuthenticationMiddlewareFactory(mockGetAuthSessionId, mockValidateAuthSessionId);
    await dvelopAuthenticationMiddleware(mockRequest, mockResponse, mockNextFunction);

    expect(mockGetAuthSessionId).not.toHaveBeenCalled();
    expect(mockValidateAuthSessionId).toHaveBeenCalledTimes(1);
    expect(mockValidateAuthSessionId).toHaveBeenCalledWith(context);
    expect(mockNextFunction).toHaveBeenCalledTimes(1);
    expect(mockRequest.dvelopContext.authSessionId).toEqual(context.authSessionId);
    expect(mockRequest.dvelopContext.user).toEqual(user);
  });

  [
    { test: "on no context", context: undefined },
    { test: "on empty context", context: {} },
    { test: "on no authSessionId in context", context: { systemBaseUri: "HiItsMeSystemBaseUri" } }
  ].forEach(testCase => {
    it(`should get authSessionId ${testCase.test}`, async () => {

      const authSessionId: string = "HiItsMeAuthSessionId";
      mockGetAuthSessionId.mockReturnValueOnce(authSessionId);
      mockRequest.dvelopContext = testCase.context;

      const user: DvelopUser = {
        displayName: "HiItsMeUser"
      };
      mockValidateAuthSessionId.mockResolvedValueOnce(user);

      const dvelopAuthenticationMiddleware: Function = _dvelopAuthenticationMiddlewareFactory(mockGetAuthSessionId, mockValidateAuthSessionId);
      await dvelopAuthenticationMiddleware(mockRequest, mockResponse, mockNextFunction);

      expect(mockGetAuthSessionId).toHaveBeenCalledTimes(1);
      expect(mockGetAuthSessionId).toHaveBeenCalledWith(mockRequest);
      expect(mockValidateAuthSessionId).toHaveBeenCalledTimes(1);
      expect(mockValidateAuthSessionId).toHaveBeenCalledWith(expect.objectContaining({ authSessionId: authSessionId }));
      expect(mockNextFunction).toHaveBeenCalledTimes(1);
      expect(mockRequest.dvelopContext.authSessionId).toEqual(authSessionId);
      expect(mockRequest.dvelopContext.user).toEqual(user);
    });
  });

  describe("_getAuthSessionIdFromRequestDefaultFunction", () => {

    [
      { bearer: "Bearer 123", authSessionId: "123" },
      { bearer: "Bearer abc", authSessionId: "abc" },
      { bearer: "Bearer #*!", authSessionId: "#*!" },
      { bearer: "Bearer abc def", authSessionId: "abc def" },
      { bearer: "nonesense", authSessionId: undefined },
    ].forEach(testCase => {
      it("should get authSessionId from BearerToken", async () => {

        (mockRequest.get as jest.Mock).mockReturnValueOnce(testCase.bearer);
        mockValidateAuthSessionId.mockResolvedValueOnce({});

        const dvelopAuthenticationMiddleware: Function = _dvelopAuthenticationMiddlewareFactory(_getAuthSessionIdFromRequestDefaultFunction, mockValidateAuthSessionId);
        await dvelopAuthenticationMiddleware(mockRequest, mockResponse, mockNextFunction);

        expect(mockRequest.get).toHaveBeenCalledTimes(1);
        expect(mockRequest.get).toHaveBeenCalledWith("Authorization");
        expect(mockRequest.dvelopContext.authSessionId).toEqual(testCase.authSessionId);
      });
    });

    it("should get authSessionId from cookies", async () => {

      const authSessionId: string = "HiItsMeAuthSessionId";
      mockRequest.cookies = { "AuthSessionId": authSessionId };
      (mockRequest.get as jest.Mock).mockReturnValueOnce(undefined);
      mockValidateAuthSessionId.mockResolvedValueOnce({});

      const dvelopAuthenticationMiddleware: Function = _dvelopAuthenticationMiddlewareFactory(_getAuthSessionIdFromRequestDefaultFunction, mockValidateAuthSessionId);
      await dvelopAuthenticationMiddleware(mockRequest, mockResponse, mockNextFunction);

      expect(mockRequest.dvelopContext.authSessionId).toEqual(authSessionId);
    });

    it("should return undefined on none", async () => {

      (mockRequest.get as jest.Mock).mockReturnValueOnce(undefined);
      mockValidateAuthSessionId.mockResolvedValueOnce({});

      const dvelopAuthenticationMiddleware: Function = _dvelopAuthenticationMiddlewareFactory(_getAuthSessionIdFromRequestDefaultFunction, mockValidateAuthSessionId);
      await dvelopAuthenticationMiddleware(mockRequest, mockResponse, mockNextFunction);

      expect(mockRequest.dvelopContext.authSessionId).toEqual(undefined);
    });
  });
});