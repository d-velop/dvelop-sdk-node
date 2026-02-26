import { dvelopFetch } from "./dvelop-fetch";
import { DvelopContext } from "../context/context";
import { generateRequestId } from "../generate-uuid/generate-uudi-id";
import { buildTraceparentHeader } from "../trace-context/traceparent-header/traceparent-header";
import { deepMergeObjects } from "../util/deep-merge-objects";

jest.mock("../generate-uuid/generate-uudi-id");
jest.mock("../trace-context/traceparent-header/traceparent-header");
jest.mock("../util/deep-merge-objects");

const mockFetch = jest.fn();
global.fetch = mockFetch as any;

describe("dvelopFetch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (deepMergeObjects as jest.Mock).mockImplementation((defaultInit, customInit) => ({
      ...defaultInit,
      ...customInit,
    }));
  });

  it("should call fetch with default headers and no context properties", async () => {
    const context: DvelopContext = {};
    const mockResponse = { status: 200 } as Response;
    mockFetch.mockResolvedValue(mockResponse);
    (generateRequestId as jest.Mock).mockReturnValue("test-request-id-123");

    const result = await dvelopFetch(context, "/api/endpoint");

    expect(result).toBe(mockResponse);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith("/api/endpoint", expect.objectContaining({
      headers: expect.objectContaining({
        "ContentType": "application/json",
        "Accept": "application/hal+json, application/json",
        "x-dv-request-id": "test-request-id-123",
      }),
    }));
  });

  it("should use provided requestId from context instead of generating one", async () => {
    const context: DvelopContext = { requestId: "provided-request-id" };
    const mockResponse = { status: 200 } as Response;
    mockFetch.mockResolvedValue(mockResponse);

    await dvelopFetch(context, "/api/endpoint");

    expect(generateRequestId).not.toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith("/api/endpoint", expect.objectContaining({
      headers: expect.objectContaining({
        "x-dv-request-id": "provided-request-id",
      }),
    }));
  });

  it("should add Authorization header when authSessionId is present", async () => {
    const context: DvelopContext = { authSessionId: "test-auth-token" };
    const mockResponse = { status: 200 } as Response;
    mockFetch.mockResolvedValue(mockResponse);
    (generateRequestId as jest.Mock).mockReturnValue("test-request-id");

    await dvelopFetch(context, "/api/endpoint");

    expect(mockFetch).toHaveBeenCalledWith("/api/endpoint", expect.objectContaining({
      headers: expect.objectContaining({
        "Authorization": "Bearer test-auth-token",
      }),
    }));
  });

  it("should add traceparent header when traceContext is present", async () => {
    const mockTraceContext = { traceId: "123", spanId: "456" };
    const context: DvelopContext = { traceContext: mockTraceContext as any };
    const mockResponse = { status: 200 } as Response;
    mockFetch.mockResolvedValue(mockResponse);
    (generateRequestId as jest.Mock).mockReturnValue("test-request-id");
    (buildTraceparentHeader as jest.Mock).mockReturnValue("00-123-456-01");

    await dvelopFetch(context, "/api/endpoint");

    expect(buildTraceparentHeader).toHaveBeenCalledWith(mockTraceContext);
    expect(mockFetch).toHaveBeenCalledWith("/api/endpoint", expect.objectContaining({
      headers: expect.objectContaining({
        "traceparent": "00-123-456-01",
      }),
    }));
  });

  it("should include both Authorization and traceparent headers", async () => {
    const mockTraceContext = { traceId: "123", spanId: "456" };
    const context: DvelopContext = {
      authSessionId: "test-auth-token",
      traceContext: mockTraceContext as any,
    };
    const mockResponse = { status: 200 } as Response;
    mockFetch.mockResolvedValue(mockResponse);
    (generateRequestId as jest.Mock).mockReturnValue("test-request-id");
    (buildTraceparentHeader as jest.Mock).mockReturnValue("00-123-456-01");

    await dvelopFetch(context, "/api/endpoint");

    const callArgs = mockFetch.mock.calls[0];
    expect(callArgs[1].headers).toMatchObject({
      "Authorization": "Bearer test-auth-token",
      "traceparent": "00-123-456-01",
      "x-dv-request-id": "test-request-id",
      "ContentType": "application/json",
      "Accept": "application/hal+json, application/json",
    });
  });

  it("should prepend systemBaseUri to input", async () => {
    const context: DvelopContext = { systemBaseUri: "https://api.example.com" };
    const mockResponse = { status: 200 } as Response;
    mockFetch.mockResolvedValue(mockResponse);
    (generateRequestId as jest.Mock).mockReturnValue("test-request-id");
    (deepMergeObjects as jest.Mock).mockImplementation((defaultInit, customInit) => ({
      ...defaultInit,
      ...customInit,
    }));

    await dvelopFetch(context, "/api/endpoint");

    expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/api/endpoint", expect.any(Object));
  });

  it("should merge custom init with default init", async () => {
    const context: DvelopContext = {};
    const customInit: RequestInit = {
      method: "POST",
      body: JSON.stringify({ data: "test" }),
    };
    const mockResponse = { status: 200 } as Response;
    mockFetch.mockResolvedValue(mockResponse);
    (generateRequestId as jest.Mock).mockReturnValue("test-request-id");

    const mergedInit = {
      headers: {
        "ContentType": "application/json",
        "Accept": "application/hal+json, application/json",
        "x-dv-request-id": "test-request-id",
      },
      method: "POST",
      body: JSON.stringify({ data: "test" }),
    };
    (deepMergeObjects as jest.Mock).mockReturnValue(mergedInit);

    await dvelopFetch(context, "/api/endpoint", customInit);

    expect(deepMergeObjects).toHaveBeenCalled();
    const defaultInitArg = (deepMergeObjects as jest.Mock).mock.calls[0][0];
    const customInitArg = (deepMergeObjects as jest.Mock).mock.calls[0][1];

    expect(defaultInitArg).toHaveProperty("headers");
    expect(customInitArg).toBe(customInit);

    expect(mockFetch).toHaveBeenCalledWith("/api/endpoint", mergedInit);
  });

  it("should handle empty custom init", async () => {
    const context: DvelopContext = {};
    const mockResponse = { status: 200 } as Response;
    mockFetch.mockResolvedValue(mockResponse);
    (generateRequestId as jest.Mock).mockReturnValue("test-request-id");

    await dvelopFetch(context, "/api/endpoint", {});

    expect(deepMergeObjects).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("should handle URL object as input", async () => {
    const context: DvelopContext = {};
    const url = new URL("https://example.com/api/endpoint");
    const mockResponse = { status: 200 } as Response;
    mockFetch.mockResolvedValue(mockResponse);
    (generateRequestId as jest.Mock).mockReturnValue("test-request-id");
    (deepMergeObjects as jest.Mock).mockImplementation((defaultInit, customInit) => ({
      ...defaultInit,
      ...customInit,
    }));

    await dvelopFetch(context, url);

    const callArgs = mockFetch.mock.calls[0];
    expect(callArgs[0]).toBe("" + url);
  });

  it("should handle fetch errors", async () => {
    const context: DvelopContext = {};
    const mockError = new Error("Network error");
    mockFetch.mockRejectedValue(mockError);
    (generateRequestId as jest.Mock).mockReturnValue("test-request-id");

    await expect(dvelopFetch(context, "/api/endpoint")).rejects.toThrow("Network error");
  });

  it("should call deepMergeObjects with default and custom init", async () => {
    const context: DvelopContext = {};
    const customInit: RequestInit = { method: "PUT" };
    const mockResponse = { status: 200 } as Response;
    mockFetch.mockResolvedValue(mockResponse);
    (generateRequestId as jest.Mock).mockReturnValue("test-request-id");
    (deepMergeObjects as jest.Mock).mockImplementation((defaultInit, customInit) => ({
      ...defaultInit,
      ...customInit,
    }));

    await dvelopFetch(context, "/api/endpoint", customInit);

    expect(deepMergeObjects).toHaveBeenCalledWith(expect.objectContaining({
      headers: expect.any(Object),
    }), customInit);
  });
});
