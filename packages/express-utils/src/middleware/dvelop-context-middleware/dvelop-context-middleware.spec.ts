import { NextFunction, Request, Response } from "express";
import { DvelopContext, DVELOP_REQUEST_ID_HEADER, DVELOP_REQUEST_SIGNATURE_HEADER, DVELOP_SYSTEM_BASE_URI_HEADER, DVELOP_TENANT_ID_HEADER } from "@dvelop-sdk/core";
import { dvelopContextMiddlewareFactory, _getDvelopContextFromRequestDefaultFunction } from "./dvelop-context-middleware";
import "../../index";

describe("dvelopContextMiddlewareFactory", () => {

  let mockGetDvelopContextFromRequest = jest.fn();
  let mockValidateDvelopContext = jest.fn();
  let mockRequest: Request;
  let mockResponse: Response;
  let mockNextFunction: NextFunction = jest.fn();
  let APP_SECRET = "HiItsMeAppSecret";

  beforeEach(() => {
    jest.resetAllMocks();
    mockRequest = { header: jest.fn() } as unknown as Request;
    mockResponse = {} as unknown as Response;
  });

  it("should initialize without optinals", () => {
    const result = dvelopContextMiddlewareFactory(APP_SECRET);
    expect(result).toBeDefined();
  });

  it("should initialize without validate-optinal", () => {
    const result = dvelopContextMiddlewareFactory(APP_SECRET, mockGetDvelopContextFromRequest);
    expect(result).toBeDefined();
  });


  it("should have correct flow", () => {

    const context: DvelopContext = {
      systemBaseUri: "HiItsMeSystemBaseUri"
    };
    mockGetDvelopContextFromRequest.mockReturnValueOnce(context);

    const dvelopContextMiddleware: Function = dvelopContextMiddlewareFactory(APP_SECRET, mockGetDvelopContextFromRequest, mockValidateDvelopContext);
    dvelopContextMiddleware(mockRequest, mockResponse, mockNextFunction);

    expect(mockGetDvelopContextFromRequest).toHaveBeenCalledWith(mockRequest);
    expect(mockValidateDvelopContext).toHaveBeenCalledWith(APP_SECRET, context);
    expect(mockNextFunction).toHaveBeenCalledTimes(1);
    expect(mockRequest.dvelopContext).toEqual(context);
  });

  it("should not catch errors", () => {

    const APP_SECRET = "HiItsMeAppSecret";
    const context: DvelopContext = {
      systemBaseUri: "HiItsMeSystemBaseUri"
    };
    const validationError: Error = new Error("HiItsMeError");
    mockGetDvelopContextFromRequest.mockReturnValueOnce(context);
    mockValidateDvelopContext.mockImplementation(() => { throw validationError; });

    const dvelopContextMiddleware: Function = dvelopContextMiddlewareFactory(APP_SECRET, mockGetDvelopContextFromRequest, mockValidateDvelopContext);

    let error: Error;
    try {
      dvelopContextMiddleware(mockRequest, mockResponse, mockNextFunction);
    } catch (e) {
      error = e;
    }

    expect(error).toBe(validationError);
  });

  describe("_getDvelopContextFromRequestDefaultFunction", () => {

    beforeEach(() => {
      mockRequest = {
        header: jest.fn()
      } as unknown as Request;
    });

    it("should set context", () => {

      const systemBaseUri: string = "HiItsMeSystemBaseUri";
      const tenantId: string = "HiItsMeTenantId";
      const requestId: string = "HiItsMeRequestId";
      const requestSignature: string = "HiItsMeRequestSignature";

      (mockRequest.header as jest.Mock).mockImplementation((header: string) => {
        switch (header) {
        case DVELOP_SYSTEM_BASE_URI_HEADER:
          return systemBaseUri;

        case DVELOP_TENANT_ID_HEADER:
          return tenantId;

        case DVELOP_REQUEST_ID_HEADER:
          return requestId;

        case DVELOP_REQUEST_SIGNATURE_HEADER:
          return requestSignature;

        default:
          throw "No other should be requested";
        }
      });

      const dvelopContextMiddleware: Function = dvelopContextMiddlewareFactory(APP_SECRET, _getDvelopContextFromRequestDefaultFunction, mockValidateDvelopContext);
      dvelopContextMiddleware(mockRequest, mockResponse, mockNextFunction);

      expect(mockRequest.dvelopContext).toEqual(expect.objectContaining({
        systemBaseUri: systemBaseUri,
        tenantId: tenantId,
        requestId: requestId,
        requestSignature: requestSignature
      }));
    });
  });
});