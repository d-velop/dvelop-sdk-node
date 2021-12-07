import { DvelopContext, DvelopSdkError } from "@dvelop-sdk/core";
import { NextFunction, Request, Response } from "express";
import { dvelopValidateSignatureMiddlewareFactory, } from "./dvelop-validate-signature-middleware";

describe("dvelopContextMiddlewareFactory", () => {

  let APP_SECRET = "HiItsMeAppSecret";
  let mockValidateDvelopContext = jest.fn();
  let mockRequest: Request;
  let mockResponse: Response;
  let mockNextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    mockRequest = { header: jest.fn() } as unknown as Request;
    mockResponse = {} as unknown as Response;
  });

  it("should initialize without optinals", () => {
    const result = dvelopValidateSignatureMiddlewareFactory(APP_SECRET);
    expect(result).toBeDefined();
  });

  it("should throw on no context", () => {

    const dvelopContextMiddleware: Function = dvelopValidateSignatureMiddlewareFactory(APP_SECRET, mockValidateDvelopContext);

    let error: DvelopSdkError;
    try {
      dvelopContextMiddleware(mockRequest, mockResponse, mockNextFunction);
    } catch (e) {
      error = e;
    }
    expect(error instanceof DvelopSdkError).toBeTruthy();
    expect(error.message).toEqual("DvelopValidateSignatureMiddleware requires dvelopContext-property to be set.");
  });

  it("should call next on valid context", () => {

    const context: DvelopContext = {
      systemBaseUri: "HiItsMeSystemBaseUri"
    };
    mockRequest.dvelopContext = context;
    mockValidateDvelopContext.mockImplementation(() => { });

    const dvelopContextMiddleware: Function = dvelopValidateSignatureMiddlewareFactory(APP_SECRET, mockValidateDvelopContext);
    dvelopContextMiddleware(mockRequest, mockResponse, mockNextFunction);

    expect(mockValidateDvelopContext).toHaveBeenCalledTimes(1);
    expect(mockValidateDvelopContext).toHaveBeenCalledWith(APP_SECRET, context);
    expect(mockNextFunction).toHaveBeenCalledTimes(1);
    expect(mockRequest.dvelopContext).toEqual(context);
  });

  it("should not catch validate-errors", () => {

    const error: Error = new Error();
    mockRequest.dvelopContext = { systemBaseUri: "HiItsMeSystemBaseUri" };
    mockValidateDvelopContext.mockImplementation(() => { throw error; });

    const dvelopContextMiddleware: Function = dvelopValidateSignatureMiddlewareFactory(APP_SECRET, mockValidateDvelopContext);

    let expectedError: Error;
    try {
      dvelopContextMiddleware(mockRequest, mockResponse, mockNextFunction);
    } catch (e) {
      expectedError = e;
    }

    expect(expectedError).toBe(error);
  });
});