import { TraceContext } from "../trace-context";
import { generateSpanId, generateTraceContextFactory, generateTraceId } from "./generate-trace-context";

describe("generateTraceContext", () => {

  let mockGenerateTraceId;
  let mockGenerateSpanId;
  let generateTraceContext;

  beforeEach(() => {

    jest.resetAllMocks();
    mockGenerateTraceId = jest.fn();
    mockGenerateSpanId = jest.fn();
    generateTraceContext = generateTraceContextFactory(mockGenerateTraceId, mockGenerateSpanId);
  });


  it("should set defaults on empty call", () => {

    const traceId = "HiItsMeTraceId";
    mockGenerateTraceId.mockReturnValue(traceId);
    const spanId = "HiItsMeSpanId";
    mockGenerateSpanId.mockReturnValue(spanId);

    const result: TraceContext = generateTraceContext();

    expect(result.traceId).toEqual(traceId);
    expect(result.spanId).toEqual(spanId);
    expect(result.parentId).toBeUndefined();
    expect(result.version).toEqual(0);
    expect(result.sampled).toBeFalsy();
  });

  it("should set values when set", () => {

    const traceId = "HiItsMeTraceId";
    const spanId = "HiItsMeSpanId";
    const parentId = "HiItsMeParentId";
    const version = 4;
    const sampled = true;

    const result: TraceContext = generateTraceContext(traceId, parentId, spanId, sampled, version);

    expect(result.traceId).toEqual(traceId);
    expect(result.spanId).toEqual(spanId);
    expect(result.parentId).toEqual(parentId);
    expect(result.version).toEqual(version);
    expect(result.sampled).toEqual(sampled);
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