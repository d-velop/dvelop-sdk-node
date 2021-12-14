import "../../index";
import { NextFunction, Request, Response } from "express";
import { DvelopContext } from "@dvelop-sdk/core";
import { DvelopUser } from "@dvelop-sdk/identityprovider";
import { _authenticationMiddlewareFactory, _getAuthSessionIdFromRequestDefaultFunction } from "./dvelop-authentication-middleware";

describe("contextMiddlewareFactory", () => {

  let mockGetAuthSessionId = jest.fn();
  let mockValidateAuthSessionId = jest.fn();
  let mockReq: Request;
  let mockRes: Response;
  let mockNext: NextFunction = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    mockReq = {
      get: jest.fn(),
      cookies: {}
    } as unknown as Request;
    mockRes = {} as unknown as Response;
  });

  it("should use authSessionId from context", async () => {

    const context: DvelopContext = {
      authSessionId: "HiItsMeAuthSessionId"
    };
    mockReq.dvelopContext = context;

    const user: DvelopUser = {
      displayName: "HiItsMeUser"
    };
    mockValidateAuthSessionId.mockResolvedValueOnce(user);

    const dvelopAuthenticationMiddleware: Function = _authenticationMiddlewareFactory(mockGetAuthSessionId, mockValidateAuthSessionId);
    await dvelopAuthenticationMiddleware(mockReq, mockRes, mockNext);

    expect(mockGetAuthSessionId).not.toHaveBeenCalled();
    expect(mockValidateAuthSessionId).toHaveBeenCalledTimes(1);
    expect(mockValidateAuthSessionId).toHaveBeenCalledWith(context);
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockReq.dvelopContext.authSessionId).toEqual(context.authSessionId);
    expect(mockReq.dvelopContext.user).toEqual(user);
  });

  [
    { test: "on no context", context: undefined },
    { test: "on empty context", context: {} },
    { test: "on no authSessionId in context", context: { systemBaseUri: "HiItsMeSystemBaseUri" } }
  ].forEach(testCase => {
    it(`should get authSessionId ${testCase.test}`, async () => {

      const authSessionId: string = "HiItsMeAuthSessionId";
      mockGetAuthSessionId.mockReturnValueOnce(authSessionId);
      mockReq.dvelopContext = testCase.context;

      const user: DvelopUser = {
        displayName: "HiItsMeUser"
      };
      mockValidateAuthSessionId.mockResolvedValueOnce(user);

      const dvelopAuthenticationMiddleware: Function = _authenticationMiddlewareFactory(mockGetAuthSessionId, mockValidateAuthSessionId);
      await dvelopAuthenticationMiddleware(mockReq, mockRes, mockNext);

      expect(mockGetAuthSessionId).toHaveBeenCalledTimes(1);
      expect(mockGetAuthSessionId).toHaveBeenCalledWith(mockReq);
      expect(mockValidateAuthSessionId).toHaveBeenCalledTimes(1);
      expect(mockValidateAuthSessionId).toHaveBeenCalledWith(expect.objectContaining({ authSessionId: authSessionId }));
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockReq.dvelopContext.authSessionId).toEqual(authSessionId);
      expect(mockReq.dvelopContext.user).toEqual(user);
    });
  });

  it("should call next on validate-error", async () => {

    const authSessionId: string = "HiItsMeAuthSessionId";
    mockGetAuthSessionId.mockReturnValueOnce(authSessionId);
    const context: DvelopContext = {
      authSessionId: "HiItsMeAuthSessionId"
    };
    mockReq.dvelopContext = context;

    const error: Error = new Error("HiItsMeError");
    mockValidateAuthSessionId.mockRejectedValueOnce(error);

    const dvelopAuthenticationMiddleware: Function = _authenticationMiddlewareFactory(mockGetAuthSessionId, mockValidateAuthSessionId);
    await dvelopAuthenticationMiddleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledWith(error);
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

        (mockReq.get as jest.Mock).mockReturnValueOnce(testCase.bearer);
        mockValidateAuthSessionId.mockResolvedValueOnce({});

        const dvelopAuthenticationMiddleware: Function = _authenticationMiddlewareFactory(_getAuthSessionIdFromRequestDefaultFunction, mockValidateAuthSessionId);
        await dvelopAuthenticationMiddleware(mockReq, mockRes, mockNext);

        expect(mockReq.get).toHaveBeenCalledTimes(1);
        expect(mockReq.get).toHaveBeenCalledWith("Authorization");
        expect(mockReq.dvelopContext.authSessionId).toEqual(testCase.authSessionId);
      });
    });

    it("should get authSessionId from cookies", async () => {

      const authSessionId: string = "HiItsMeAuthSessionId";
      mockReq.cookies = { "AuthSessionId": authSessionId };
      (mockReq.get as jest.Mock).mockReturnValueOnce(undefined);
      mockValidateAuthSessionId.mockResolvedValueOnce({});

      const dvelopAuthenticationMiddleware: Function = _authenticationMiddlewareFactory(_getAuthSessionIdFromRequestDefaultFunction, mockValidateAuthSessionId);
      await dvelopAuthenticationMiddleware(mockReq, mockRes, mockNext);

      expect(mockReq.dvelopContext.authSessionId).toEqual(authSessionId);
    });

    it("should return undefined on none", async () => {

      (mockReq.get as jest.Mock).mockReturnValueOnce(undefined);
      mockValidateAuthSessionId.mockResolvedValueOnce({});

      const dvelopAuthenticationMiddleware: Function = _authenticationMiddlewareFactory(_getAuthSessionIdFromRequestDefaultFunction, mockValidateAuthSessionId);
      await dvelopAuthenticationMiddleware(mockReq, mockRes, mockNext);

      expect(mockReq.dvelopContext.authSessionId).toEqual(undefined);
    });
  });
});