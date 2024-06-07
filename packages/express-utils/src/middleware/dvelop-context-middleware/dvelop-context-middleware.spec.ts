import { NextFunction, Request, Response } from "express";
import {
  DVELOP_REQUEST_ID_HEADER,
  DVELOP_REQUEST_SIGNATURE_HEADER,
  DVELOP_SYSTEM_BASE_URI_HEADER,
  DVELOP_TENANT_ID_HEADER,
  TraceContext,
  TraceContextError,
  TRACEPARENT_HEADER,
} from "@dvelop-sdk/core";
import { contextMiddlewareFactory } from "./dvelop-context-middleware";
import "../../index";

describe("contextMiddlewareFactory", () => {

  let mockParseTraceparentHeader = jest.fn();
  let mockGenerateTraceContext = jest.fn();

  let mockReq: Request;
  let mockRes: Response;
  let mockNext: NextFunction = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();

    mockParseTraceparentHeader = jest.fn();
    mockGenerateTraceContext = jest.fn();

    mockReq = { header: jest.fn() } as unknown as Request;
    mockRes = {} as unknown as Response;
  });

  describe("dvelopContext", () => {
    it("should set context from headers on no systemBaseUri", () => {

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

      contextMiddlewareFactory(mockParseTraceparentHeader, mockGenerateTraceContext)(mockReq, mockRes, mockNext);

      expect(mockReq.dvelopContext).toEqual(expect.objectContaining({
        systemBaseUri: systemBaseUri,
        tenantId: tenantId,
        requestId: requestId,
        requestSignature: requestSignature,
        traceContext: undefined
      }));
    });

    it("should not set systemBaseUri and tenantId from input if provided", () => {

      const systemBaseUri: string = "HiItsMeSystemBaseUri";
      const tenantId: string = "HiItsMeTenantId";
      const requestId: string = "HiItsMeRequestId";

      (mockReq.header as jest.Mock).mockImplementation((header: string) => {
        switch (header) {

          case DVELOP_REQUEST_ID_HEADER:
            return requestId;

          case TRACEPARENT_HEADER:
            return undefined;

          default:
            throw "No other should be requested";
        }
      });

      contextMiddlewareFactory(mockParseTraceparentHeader, mockGenerateTraceContext, systemBaseUri, tenantId)(mockReq, mockRes, mockNext);

      expect(mockReq.dvelopContext).toEqual(expect.objectContaining({
        systemBaseUri: systemBaseUri,
        tenantId: tenantId,
        requestId: requestId,
        traceContext: undefined
      }));
    });

    it("should set systemBaseUri from input and tenantId from headers if only systemBaseUri is provided", () => {

      const systemBaseUri: string = "HiItsMeSystemBaseUri";
      const tenantId: string = "HiItsMeTenantId";
      const requestId: string = "HiItsMeRequestId";
      const requestSignature: string = "HiItsMeRequestSignature";

      (mockReq.header as jest.Mock).mockImplementation((header: string) => {
        switch (header) {

          case DVELOP_TENANT_ID_HEADER:
            return tenantId;

          case DVELOP_REQUEST_ID_HEADER:
            return requestId;

          case TRACEPARENT_HEADER:
            return undefined;

          default:
            throw "No other should be requested";
        }
      });

      contextMiddlewareFactory(mockParseTraceparentHeader, mockGenerateTraceContext, systemBaseUri)(mockReq, mockRes, mockNext);

      expect(mockReq.dvelopContext).toEqual(expect.objectContaining({
        systemBaseUri: systemBaseUri,
        tenantId: tenantId,
        requestId: requestId,
        traceContext: undefined
      }));
    });
  });

  describe("traceContext", () => {
    it("should set traceContext on traceparent-header", () => {

      const traceparentHeader = "HiItsMeTraceparentHeader";
      const traceContext: TraceContext = { traceId: "traceId" } as TraceContext;
      mockParseTraceparentHeader.mockReturnValue(traceContext);

      (mockReq.header as jest.Mock).mockImplementation((header: string) => {
        switch (header) {
          case TRACEPARENT_HEADER:
            return traceparentHeader;
          default:
            return "HiItsMeHeader";
        }
      });

      contextMiddlewareFactory(mockParseTraceparentHeader, mockGenerateTraceContext)(mockReq, mockRes, mockNext);
      expect(mockReq.dvelopContext.traceContext).toEqual(traceContext);
      expect(mockParseTraceparentHeader).toHaveBeenCalledTimes(1);
      expect(mockParseTraceparentHeader).toHaveBeenCalledWith(traceparentHeader);
      expect(mockGenerateTraceContext).toHaveBeenCalledTimes(0);
    });

    it("should generate traceContext on no traceparent-header", () => {

      const traceContext: TraceContext = { traceId: "traceId" } as TraceContext;
      mockGenerateTraceContext.mockReturnValue(traceContext);

      (mockReq.header as jest.Mock).mockImplementation((header: string) => {
        switch (header) {
          case TRACEPARENT_HEADER:
            return undefined;
          default:
            return "HiItsMeHeader";
        }
      });

      contextMiddlewareFactory(mockParseTraceparentHeader, mockGenerateTraceContext)(mockReq, mockRes, mockNext);

      expect(mockReq.dvelopContext.traceContext).toEqual(traceContext);
      expect(mockParseTraceparentHeader).toHaveBeenCalledTimes(0);
      expect(mockGenerateTraceContext).toHaveBeenCalledTimes(1);
    });

    it("should generate traceContext on traceparent-header parsing error", () => {

      const traceparentHeader: string = "HiItsMeTraceparentHeader";
      mockParseTraceparentHeader.mockImplementation((_: string) => { throw new TraceContextError(""); });

      const traceContext: TraceContext = { traceId: "traceId" } as TraceContext;
      mockGenerateTraceContext.mockReturnValue(traceContext);

      (mockReq.header as jest.Mock).mockImplementation((header: string) => {
        switch (header) {
          case TRACEPARENT_HEADER:
            return traceparentHeader;
          default:
            return "HiItsMeHeader";
        }
      });

      contextMiddlewareFactory(mockParseTraceparentHeader, mockGenerateTraceContext)(mockReq, mockRes, mockNext);

      expect(mockReq.dvelopContext.traceContext).toEqual(traceContext);
      expect(mockParseTraceparentHeader).toHaveBeenCalledTimes(1);
      expect(mockParseTraceparentHeader).toHaveBeenCalledWith(traceparentHeader);
      expect(mockGenerateTraceContext).toHaveBeenCalledTimes(1);
    });

  });

});
