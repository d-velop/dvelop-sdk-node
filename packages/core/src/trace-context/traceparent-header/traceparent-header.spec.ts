import { TraceContext } from "../trace-context";
import { TraceContextError } from "../trace-context-error";
import { buildTraceparentHeader, parseTraceparentHeader } from "./traceparent-header";

describe("parseTraceparentHeader", () => {
  it("should return Traceparent object when valid traceparent header is given", () => {
    const headerValue = "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01";
    const traceparent: TraceContext = parseTraceparentHeader(headerValue);
    expect(traceparent.traceId).toEqual("4bf92f3577b34da6a3ce929d0e0e4736");
    expect(traceparent.parentId).toEqual("00f067aa0ba902b7");
    expect(traceparent.version).toEqual(0);
    expect(traceparent.sampled).toBeTruthy();
  });

  it("should throw Error when invalid traceparent header is given", () => {
    const headerValue = "0-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01-12";
    expect(() => parseTraceparentHeader((headerValue))).toThrow(TraceContextError);
    expect(() => parseTraceparentHeader((headerValue))).toThrow("traceparent-Header '0-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01-12' is malformed.");
  });

  it("should throw Error when traceparent header contains invalid version", () => {
    const headerValue = "0-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01";
    expect(() => parseTraceparentHeader((headerValue))).toThrow(TraceContextError);
    expect(() => parseTraceparentHeader((headerValue))).toThrow("traceparent-Header '0-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01' is malformed.");
  });

  it("should throw Error when traceparent header contains invalid flags", () => {
    const headerValue = "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-0";
    expect(() => parseTraceparentHeader((headerValue))).toThrow(TraceContextError);
    expect(() => parseTraceparentHeader((headerValue))).toThrow("traceparent-Header '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-0' is malformed.");
  });

  it("should throw Error when traceparent header contains invalid traceId", () => {
    const headerValue = "00-00f067aa0ba902b7-00f067aa0ba902b7-01";
    expect(() => parseTraceparentHeader((headerValue))).toThrow(TraceContextError);
    expect(() => parseTraceparentHeader((headerValue))).toThrow("traceparent-Header '00-00f067aa0ba902b7-00f067aa0ba902b7-01' is malformed.");
  });

  it("should throw Error when traceparent header contains invalid parentId", () => {
    const headerValue = "00-4bf92f3577b34da6a3ce929d0e0e4736-4bf92f3577b34da6a3ce929d0e0e4736-01";
    expect(() => parseTraceparentHeader((headerValue))).toThrow(TraceContextError);
    expect(() => parseTraceparentHeader((headerValue))).toThrow("traceparent-Header '00-4bf92f3577b34da6a3ce929d0e0e4736-4bf92f3577b34da6a3ce929d0e0e4736-01' is malformed.");
  });
});

describe("buildTraceparentHeader", () => {
  it("should return traceparent header when valid input without flags is given", () => {
    const traceId = "4bf92f3577b34da6a3ce929d0e0e4736";
    const spanId = "00f067aa0ba902b7";
    const header = buildTraceparentHeader({ traceId: traceId, spanId: spanId, version: 0, sampled: true });
    expect(header).toEqual(`00-${traceId}-${spanId}-01`);
  });

  it("should return traceparent header when valid input with flags set to false is given", () => {
    const traceId = "4bf92f3577b34da6a3ce929d0e0e4736";
    const spanId = "00f067aa0ba902b7";
    const header = buildTraceparentHeader({ traceId: traceId, spanId: spanId, version: 0, sampled: false });
    expect(header).toEqual(`00-${traceId}-${spanId}-00`);
  });

  it("should return traceparent header when valid input with flags set to true is given", () => {
    const traceId = "4bf92f3577b34da6a3ce929d0e0e4736";
    const spanId = "00f067aa0ba902b7";
    const header = buildTraceparentHeader({ traceId: traceId, spanId: spanId, version: 0, sampled: true });
    expect(header).toEqual(`00-${traceId}-${spanId}-01`);
  });

  it("should throw Error when invalid traceId is given", () => {
    const traceId = "00f067aa0ba902b7";
    const spanId = "00f067aa0ba902b7";
    expect(() => buildTraceparentHeader({ traceId: traceId, spanId: spanId, version: 0, sampled: true })).toThrow(TraceContextError);
    expect(() => buildTraceparentHeader({ traceId: traceId, spanId: spanId, version: 0, sampled: true })).toThrow("TraceId '00f067aa0ba902b7' is malformed.");
  });

  it("should throw Error when invalid spanId is given", () => {
    const traceId = "4bf92f3577b34da6a3ce929d0e0e4736";
    const spanId = "4bf92f3577b34da6a3ce929d0e0e4736";
    expect(() => buildTraceparentHeader({ traceId: traceId, spanId: spanId, version: 0, sampled: true })).toThrow(TraceContextError);
    expect(() => buildTraceparentHeader({ traceId: traceId, spanId: spanId, version: 0, sampled: true })).toThrow("SpanId '4bf92f3577b34da6a3ce929d0e0e4736' is malformed.");
  });
});
