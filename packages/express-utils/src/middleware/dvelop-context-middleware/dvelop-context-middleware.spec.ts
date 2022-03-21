import { NextFunction, Request, Response } from "express";
import {
  DVELOP_REQUEST_ID_HEADER,
  DVELOP_REQUEST_SIGNATURE_HEADER,
  DVELOP_SYSTEM_BASE_URI_HEADER,
  DVELOP_TENANT_ID_HEADER,
  TRACEPARENT_HEADER,
} from "@dvelop-sdk/core";
import { contextMiddleware } from "./dvelop-context-middleware";
import "../../index";

describe("contextMiddlewareFactory", () => {

  let mockReq: Request;
  let mockRes: Response;
  let mockNext: NextFunction = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    mockReq = { header: jest.fn() } as unknown as Request;
    mockRes = {} as unknown as Response;
  });

  it("should set context", () => {

    const systemBaseUri: string = "HiItsMeSystemBaseUri";
    const tenantId: string = "HiItsMeTenantId";
    const requestId: string = "HiItsMeRequestId";
    const requestSignature: string = "HiItsMeRequestSignature";

    (mockReq.header as jest.Mock).mockImplementation((header: string) => {
      switch (header) {
      case DVELOP_SYSTEM_BASE_URI_HEADER:
        return systemBaseUri;

      case DVELOP_TENANT_ID_HEADER:
        return tenantId;

      case DVELOP_REQUEST_ID_HEADER:
        return requestId;

      case DVELOP_REQUEST_SIGNATURE_HEADER:
        return requestSignature;

      case TRACEPARENT_HEADER:
        return undefined;

      default:
        throw "No other should be requested";
      }
    });

    contextMiddleware(mockReq, mockRes, mockNext);

    expect(mockReq.dvelopContext).toEqual(expect.objectContaining({
      systemBaseUri: systemBaseUri,
      tenantId: tenantId,
      requestId: requestId,
      requestSignature: requestSignature,
    }));
    expect(mockReq.dvelopContext.traceId).toHaveLength(32);
    expect(mockReq.dvelopContext.spanId).toHaveLength(16);
  });

  it("should set context with traceparent", () => {

    const systemBaseUri: string = "HiItsMeSystemBaseUri";
    const tenantId: string = "HiItsMeTenantId";
    const requestId: string = "HiItsMeRequestId";
    const requestSignature: string = "HiItsMeRequestSignature";
    const traceId: string = "4bf92f3577b34da6a3ce929d0e0e4736";
    const parentId: string = "00f067aa0ba902b7";
    const traceparent: string = `00-${traceId}-${parentId}-01`;

    (mockReq.header as jest.Mock).mockImplementation((header: string) => {
      switch (header) {
      case DVELOP_SYSTEM_BASE_URI_HEADER:
        return systemBaseUri;

      case DVELOP_TENANT_ID_HEADER:
        return tenantId;

      case DVELOP_REQUEST_ID_HEADER:
        return requestId;

      case DVELOP_REQUEST_SIGNATURE_HEADER:
        return requestSignature;

      case TRACEPARENT_HEADER:
        return traceparent;

      default:
        throw "No other should be requested";
      }
    });

    contextMiddleware(mockReq, mockRes, mockNext);

    expect(mockReq.dvelopContext).toEqual(expect.objectContaining({
      systemBaseUri: systemBaseUri,
      tenantId: tenantId,
      requestId: requestId,
      requestSignature: requestSignature,
      traceId: traceId,
    }));
    expect(mockReq.dvelopContext.spanId).toHaveLength(16);
    expect(mockReq.dvelopContext.spanId).not.toEqual(parentId);
  });
});
