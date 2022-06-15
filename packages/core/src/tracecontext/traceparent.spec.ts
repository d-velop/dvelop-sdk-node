import {
  buildTraceparentHeader,
  generateSpanId,
  generateTraceId,
  parseTraceparentHeader,
  TraceContext
} from "./traceparent";
import {DvelopSdkError} from "../errors/errors";

describe("parseTraceparentHeader", () => {
  it("should return Traceparent object when valid traceparent header is given", () => {
    const headerValue = "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01";
    const traceparent: TraceContext = parseTraceparentHeader(headerValue);
    expect(traceparent.traceId).toEqual("4bf92f3577b34da6a3ce929d0e0e4736");
    expect(traceparent.parentId).toEqual("00f067aa0ba902b7");
    expect(traceparent.version).toEqual(0);
    expect(traceparent.traceFlags.sampled).toBeTruthy();
  });

  it("should throw Error when invalid traceparent header is given", () => {
    const headerValue = "0-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01-12";
    expect(() => parseTraceparentHeader((headerValue))).toThrow(DvelopSdkError);
    expect(() => parseTraceparentHeader((headerValue))).toThrow("Invalid traceparent header");
  });

  it("should throw Error when traceparent header contains invalid version", () => {
    const headerValue = "0-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01";
    expect(() => parseTraceparentHeader((headerValue))).toThrow(DvelopSdkError);
    expect(() => parseTraceparentHeader((headerValue))).toThrow("Invalid traceparent header");
  });

  it("should throw Error when traceparent header contains invalid flags", () => {
    const headerValue = "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-0";
    expect(() => parseTraceparentHeader((headerValue))).toThrow(DvelopSdkError);
    expect(() => parseTraceparentHeader((headerValue))).toThrow("Invalid traceparent header");
  });

  it("should throw Error when traceparent header contains invalid traceId", () => {
    const headerValue = "00-00f067aa0ba902b7-00f067aa0ba902b7-01";
    expect(() => parseTraceparentHeader((headerValue))).toThrow(DvelopSdkError);
    expect(() => parseTraceparentHeader((headerValue))).toThrow("Invalid traceparent header");
  });

  it("should throw Error when traceparent header contains invalid parentId", () => {
    const headerValue = "00-4bf92f3577b34da6a3ce929d0e0e4736-4bf92f3577b34da6a3ce929d0e0e4736-01";
    expect(() => parseTraceparentHeader((headerValue))).toThrow(DvelopSdkError);
    expect(() => parseTraceparentHeader((headerValue))).toThrow("Invalid traceparent header");
  });
});

describe("buildTraceparentHeader", () => {
  it("should return traceparent header when valid input without flags is given", () => {
    const traceId = "4bf92f3577b34da6a3ce929d0e0e4736";
    const spanId = "00f067aa0ba902b7";
    const header = buildTraceparentHeader(traceId, spanId);
    expect(header).toEqual(`00-${traceId}-${spanId}-01`);
  });

  it("should return traceparent header when valid input with flags set to false is given", () => {
    const traceId = "4bf92f3577b34da6a3ce929d0e0e4736";
    const spanId = "00f067aa0ba902b7";
    const header = buildTraceparentHeader(traceId, spanId, {sampled: false});
    expect(header).toEqual(`00-${traceId}-${spanId}-00`);
  });

  it("should return traceparent header when valid input with flags set to true is given", () => {
    const traceId = "4bf92f3577b34da6a3ce929d0e0e4736";
    const spanId = "00f067aa0ba902b7";
    const header = buildTraceparentHeader(traceId, spanId, {sampled: true});
    expect(header).toEqual(`00-${traceId}-${spanId}-01`);
  });

  it("should throw Error when invalid traceId is given", () => {
    const traceId = "00f067aa0ba902b7";
    const spanId = "00f067aa0ba902b7";
    expect(() => buildTraceparentHeader(traceId, spanId)).toThrow(DvelopSdkError);
    expect(() => buildTraceparentHeader(traceId, spanId)).toThrow("Invalid traceId");
  });

  it("should throw Error when invalid spanId is given", () => {
    const traceId = "4bf92f3577b34da6a3ce929d0e0e4736";
    const spanId = "4bf92f3577b34da6a3ce929d0e0e4736";
    expect(() => buildTraceparentHeader(traceId, spanId)).toThrow(DvelopSdkError);
    expect(() => buildTraceparentHeader(traceId, spanId)).toThrow("Invalid spanId");
  });
});

describe("generateTraceId", () => {
  it("should return string with correct length and only allowed characters", () => {
    const traceId = generateTraceId();
    expect(traceId).toHaveLength(32);
    expect(/^[\da-f]{32}$/.test(traceId)).toBeTruthy();
  });
});

describe("generateSpanId", () => {
  it("should return string with correct length and only allowed characters", () => {
    const traceId = generateSpanId();
    expect(traceId).toHaveLength(16);
    expect(/^[\da-f]{16}$/.test(traceId)).toBeTruthy();
  });
});
