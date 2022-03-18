import {parseTraceparent, TraceFlags, Traceparent} from "./traceparent";
import {DvelopSdkError} from "../errors/errors";

describe("parseTraceParent", () => {
  it("should return Traceparent object when valid traceparent header is given", () => {
    const headerValue = "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-05";
    const traceparent: Traceparent = parseTraceparent(headerValue);
    expect(traceparent.traceId).toEqual("4bf92f3577b34da6a3ce929d0e0e4736");
    expect(traceparent.parentId).toEqual("00f067aa0ba902b7");
    expect(traceparent.version).toEqual(0);
    expect(traceparent.traceFlags & TraceFlags.sampled).toEqual(TraceFlags.sampled);
  });

  it("should throw Error when traceparent header contains invalid version", () => {
    const headerValue = "0-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01";
    expect(() => parseTraceparent((headerValue))).toThrow(DvelopSdkError);
    expect(() => parseTraceparent((headerValue))).toThrow("Invalid traceparent header");
  });

  it("should throw Error when traceparent header contains invalid flags", () => {
    const headerValue = "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-0";
    expect(() => parseTraceparent((headerValue))).toThrow(DvelopSdkError);
    expect(() => parseTraceparent((headerValue))).toThrow("Invalid traceparent header");
  });

  it("should throw Error when traceparent header contains invalid traceId", () => {
    const headerValue = "00-00f067aa0ba902b7-00f067aa0ba902b7-01";
    expect(() => parseTraceparent((headerValue))).toThrow(DvelopSdkError);
    expect(() => parseTraceparent((headerValue))).toThrow("Invalid traceparent header");
  });

  it("should throw Error when traceparent header contains invalid parentId", () => {
    const headerValue = "00-4bf92f3577b34da6a3ce929d0e0e4736-4bf92f3577b34da6a3ce929d0e0e4736-01";
    expect(() => parseTraceparent((headerValue))).toThrow(DvelopSdkError);
    expect(() => parseTraceparent((headerValue))).toThrow("Invalid traceparent header");
  });
});
