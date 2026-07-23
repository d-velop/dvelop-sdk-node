/// <reference types="jest" />
import { DvelopContext } from "../context/context";
import { generateRequestId } from "../generate-uuid/generate-uudi-id";
import { DvelopOptions } from "../options/options";
import { TraceContext } from "../trace-context/trace-context";
import { buildTraceparentHeader } from "../trace-context/traceparent-header/traceparent-header";
import { dvelopFetch } from "./fetch";

jest.mock("../generate-uuid/generate-uudi-id");
const mockGenerateRequestId = generateRequestId as jest.MockedFunction<typeof generateRequestId>;

jest.mock("../trace-context/traceparent-header/traceparent-header");
const mockBuildTraceparentHeader = buildTraceparentHeader as jest.MockedFunction<typeof buildTraceparentHeader>;

describe("dvelopFetch", () => {

  let mockFetch: jest.SpyInstance;
  let mockResponse: Response;

  beforeEach(() => {
    jest.resetAllMocks();
    mockResponse = new Response();
    mockFetch = jest.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse);
    mockGenerateRequestId.mockReturnValue("generated-request-id");
    mockBuildTraceparentHeader.mockReturnValue("00-traceid-spanid-01");
  });

  describe("URL construction", () => {

    it("should call fetch with systemBaseUri concatenated with path", async () => {
      const context: DvelopContext = { systemBaseUri: "https://example.d-velop.cloud" };
      await dvelopFetch(context, "/some/path", {});
      expect(mockFetch).toHaveBeenCalledWith("https://example.d-velop.cloud/some/path", expect.anything());
    });
  });

  describe("default headers", () => {

    it("should set Content-Type to application/json", async () => {
      await dvelopFetch({}, "/path", {});
      const headers = mockFetch.mock.calls[0][1].headers as Record<string, string>;
      expect(headers["Content-Type"]).toBe("application/json");
    });

    it("should set Authorization with authSessionId as Bearer token", async () => {
      const context: DvelopContext = { authSessionId: "my-session-id" };
      await dvelopFetch(context, "/path", {});
      const headers = mockFetch.mock.calls[0][1].headers as Record<string, string>;
      expect(headers["Authorization"]).toBe("Bearer my-session-id");
    });

    it("should set x-dv-request-id from context when provided", async () => {
      const context: DvelopContext = { requestId: "context-request-id" };
      await dvelopFetch(context, "/path", {});
      const headers = mockFetch.mock.calls[0][1].headers as Record<string, string>;
      expect(headers["x-dv-request-id"]).toBe("context-request-id");
      expect(mockGenerateRequestId).not.toHaveBeenCalled();
    });

    it("should generate x-dv-request-id when context provides no requestId", async () => {
      await dvelopFetch({}, "/path", {});
      expect(mockGenerateRequestId).toHaveBeenCalledTimes(1);
      const headers = mockFetch.mock.calls[0][1].headers as Record<string, string>;
      expect(headers["x-dv-request-id"]).toBe("generated-request-id");
    });

    it("should build and set traceparent header when traceContext is provided", async () => {
      const traceContext: TraceContext = { traceId: "trace", spanId: "span", version: 0, sampled: true };
      const context: DvelopContext = { traceContext };
      await dvelopFetch(context, "/path", {});
      expect(mockBuildTraceparentHeader).toHaveBeenCalledWith(traceContext);
      const headers = mockFetch.mock.calls[0][1].headers as Record<string, string>;
      expect(headers["traceparent"]).toBe("00-traceid-spanid-01");
    });

    it("should set traceparent to empty string when no traceContext provided", async () => {
      await dvelopFetch({}, "/path", {});
      expect(mockBuildTraceparentHeader).not.toHaveBeenCalled();
      const headers = mockFetch.mock.calls[0][1].headers as Record<string, string>;
      expect(headers["traceparent"]).toBe("");
    });
  });

  describe("init merging", () => {

    it("should include provided init properties in request", async () => {
      await dvelopFetch({}, "/path", { method: "POST", body: "payload" });
      const init = mockFetch.mock.calls[0][1];
      expect(init.method).toBe("POST");
      expect(init.body).toBe("payload");
    });

    it("should merge initOverwrite headers from options over defaults", async () => {
      const options: DvelopOptions<Response> = {
        initOverwrite: { headers: { "Content-Type": "text/plain", "X-Custom": "value" } }
      };
      await dvelopFetch({}, "/path", {}, options);
      const headers = mockFetch.mock.calls[0][1].headers as Record<string, string>;
      expect(headers["Content-Type"]).toBe("text/plain");
      expect(headers["X-Custom"]).toBe("value");
    });

    it("should use empty initOverwrite when options provides none", async () => {
      const options: DvelopOptions<Response> = { onResponse: jest.fn().mockResolvedValue(mockResponse) };
      await dvelopFetch({}, "/path", {}, options);
      const headers = mockFetch.mock.calls[0][1].headers as Record<string, string>;
      expect(headers["Content-Type"]).toBe("application/json");
    });
  });

  describe("response handling", () => {

    it("should return raw Response when no options given", async () => {
      const result = await dvelopFetch({}, "/path", {});
      expect(result).toBe(mockResponse);
    });

    it("should return raw Response when options has no onResponse", async () => {
      const options: DvelopOptions<Response> = { initOverwrite: {} };
      const result = await dvelopFetch({}, "/path", {}, options);
      expect(result).toBe(mockResponse);
    });

    it("should call onResponse with the fetch response and return its result", async () => {
      const parsedData = { id: 42, name: "test" };
      const onResponse = jest.fn().mockResolvedValue(parsedData);
      const options: DvelopOptions<typeof parsedData> = { onResponse };
      const result = await dvelopFetch({}, "/path", {}, options);
      expect(onResponse).toHaveBeenCalledWith(mockResponse);
      expect(result).toEqual(parsedData);
    });

    it("should support synchronous onResponse callback", async () => {
      const parsedData = "sync-result";
      const options: DvelopOptions<string> = { onResponse: jest.fn().mockReturnValue(parsedData) };
      const result = await dvelopFetch({}, "/path", {}, options);
      expect(result).toBe(parsedData);
    });
  });
});
