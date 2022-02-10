import { ValidateCloudCenterEventSignatureParams } from "@dvelop-sdk/app-router/lib/validate-cloud-center-event-signature/validate-cloud-center-event-signature";
import { Request, Response, NextFunction } from "express";
import { IncomingHttpHeaders } from "http2";
import { validateCloudCenterEventSignatureMiddlewareFactory } from "./validate-cloud-center-event-signature-middleware";

describe("alidateCloudCenterEventSignatureMiddlewareFactory", () => {

  let APP_SECRET = "HiItsMeAppSecret";
  let mockValidateCloudCenterEventSignature = jest.fn();
  let mockRequest: Request;
  let expectedParams: ValidateCloudCenterEventSignatureParams;
  let mockResponse: Response;
  let mockNextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    mockResponse = {} as unknown as Response;

    mockRequest = {
      method: "get",
      originalUrl: "https://tenant.d-velop.cloud/myapp/cloud-center-events",
      path: "/myapp/cloud-center-events",
      headers: {
        "authorization": "Bearer HiItsMeCloudCenterEventSignature",
        "test": "HiItsMeTest",
        "test2": "HiItsMeTest2"
      } as IncomingHttpHeaders,
      body: {
        "hi": "ItsMeBody",
        "ho": "ItsMeAnotherBody"
      }
    } as Request;

    expectedParams = {
      httpMethod: "get",
      resourcePath: "/myapp/cloud-center-events",
      queryString: "",
      headers: {
        "authorization": "Bearer HiItsMeCloudCenterEventSignature",
        "test": "HiItsMeTest",
        "test2": "HiItsMeTest2"
      },
      payload: {
        "hi": "ItsMeBody",
        "ho": "ItsMeAnotherBody"
      },
      cloudCenterEventSignature: "HiItsMeCloudCenterEventSignature",
    };
  });

  it("should initialize without optinals", () => {
    const result = validateCloudCenterEventSignatureMiddlewareFactory(APP_SECRET);
    expect(result).toBeDefined();
  });

  [
    () => {
      mockRequest.method = "HiItsMeMethod";
      expectedParams.httpMethod = "HiItsMeMethod";
    },
    () => {
      mockRequest.path = "HiItsMePath";
      expectedParams.resourcePath = "HiItsMePath";
    },
    () => {
      mockRequest.originalUrl = "HiItsMeUrl";
      expectedParams.queryString = "";
    },
    () => {
      mockRequest.originalUrl = "Hi/Its/MeUrl?HiItsMeQuery";
      expectedParams.queryString = "HiItsMeQuery";
    },
    () => {
      mockRequest.originalUrl = "?HiItsMeQuery";
      expectedParams.queryString = "HiItsMeQuery";
    },
    () => {
      mockRequest.headers = {
        "authorization": "Bearer HiItsMeSignature",
        "test1": "HiItsMeHeader1",
        "test2": "HiItsMeHeader2"
      };
      expectedParams.headers = {
        "authorization": "Bearer HiItsMeSignature",
        "test1": "HiItsMeHeader1",
        "test2": "HiItsMeHeader2"
      };
      expectedParams.cloudCenterEventSignature = "HiItsMeSignature";
    },
    () => {
      mockRequest.headers = {
        "test1": "HiItsMeHeader1",
        "test2": "HiItsMeHeader2",
      };
      expectedParams.headers = {
        "test1": "HiItsMeHeader1",
        "test2": "HiItsMeHeader2"
      };
      expectedParams.cloudCenterEventSignature = "";
    },
    () => {
      mockRequest.headers = {};
      expectedParams.headers = {};
      expectedParams.cloudCenterEventSignature = "";
    },
    () => {
      mockRequest.headers = {
        "test1": ["HiItsMeHeader1", "HiItsMeHeader2"]
      };
      expectedParams.headers = {
        "test1": "HiItsMeHeader1, HiItsMeHeader2",
      };
      expectedParams.cloudCenterEventSignature = "";
    },
    () => {
      mockRequest.body = {
        "test1": "HiItsMeTest1",
        "test2": "HiItsMeTest2"
      };
      expectedParams.payload = {
        "test1": "HiItsMeTest1",
        "test2": "HiItsMeTest2"
      };
    },
    () => {
      mockRequest.body = undefined;
      expectedParams.payload = undefined;
    },
  ].forEach(testCasePreperation => {
    it("should call validateCloudCenterEventSignature correctly", () => {

      testCasePreperation();

      const middleware = validateCloudCenterEventSignatureMiddlewareFactory(APP_SECRET, mockValidateCloudCenterEventSignature);
      middleware(mockRequest, mockResponse, mockNextFunction);

      expect(mockValidateCloudCenterEventSignature).toHaveBeenCalledTimes(1);
      expect(mockValidateCloudCenterEventSignature).toHaveBeenCalledWith(APP_SECRET, expectedParams);
    });
  });

  it("should call next on valid signature", () => {

    mockValidateCloudCenterEventSignature.mockImplementation(() => { });

    const middleware = validateCloudCenterEventSignatureMiddlewareFactory(APP_SECRET, mockValidateCloudCenterEventSignature);
    middleware(mockRequest, mockResponse, mockNextFunction);

    expect(mockNextFunction).toHaveBeenCalledTimes(1);
  });

  it("should not catch validate-errors", () => {

    const error: Error = new Error();
    mockValidateCloudCenterEventSignature.mockImplementation(() => { throw error; });

    const middleware = validateCloudCenterEventSignatureMiddlewareFactory(APP_SECRET, mockValidateCloudCenterEventSignature);

    let expectedError: Error;
    try {
      middleware(mockRequest, mockResponse, mockNextFunction);
    } catch (e) {
      expectedError = e;
    }

    expect(expectedError).toBe(error);
  });
});
