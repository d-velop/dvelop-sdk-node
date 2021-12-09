import { NextFunction, Request, Response } from "express";
import { DVELOP_REQUEST_ID_HEADER, DVELOP_REQUEST_SIGNATURE_HEADER, DVELOP_SYSTEM_BASE_URI_HEADER, DVELOP_TENANT_ID_HEADER } from "@dvelop-sdk/core";
import { dvelopContextMiddleware } from "./dvelop-context-middleware";
import "../../index";

describe("dvelopContextMiddlewareFactory", () => {

  let mockRequest: Request;
  let mockResponse: Response;
  let mockNextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    mockRequest = { header: jest.fn() } as unknown as Request;
    mockResponse = {} as unknown as Response;
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

    dvelopContextMiddleware(mockRequest, mockResponse, mockNextFunction);

    expect(mockRequest.dvelopContext).toEqual(expect.objectContaining({
      systemBaseUri: systemBaseUri,
      tenantId: tenantId,
      requestId: requestId,
      requestSignature: requestSignature
    }));
  });
});