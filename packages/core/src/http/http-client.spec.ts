import axios, { AxiosInstance } from "axios";
import { DVELOP_REQUEST_ID_HEADER, TRACEPARENT_HEADER } from "../http/http-headers";
import { DvelopContext } from "../context/context";
import { axiosFollowHalJsonFunctionFactory } from "./axios-follow-hal-json";
import { DvelopHttpClient, DvelopHttpRequestConfig, axiosHttpClientFactory, axiosInstanceFactory } from "./http-client";
import { TraceContext } from "../tracecontext/traceparent";

jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

jest.mock("./axios-follow-hal-json");
const mockAxiosFollowHalJsonFunctionFactory = axiosFollowHalJsonFunctionFactory as jest.Mocked<typeof axiosFollowHalJsonFunctionFactory>;

describe("axiosInstanceFactory", () => {
  it("should correctly initialize AxiosInstance", () => {

    let mockAxiosInstance: AxiosInstance = {
      interceptors: {
        request: {
          use: jest.fn()
        }
      }
    } as unknown as AxiosInstance;

    let mockAxiosFollowHalJson = jest.fn();

    (mockAxiosFollowHalJsonFunctionFactory as jest.Mock).mockReturnValue(mockAxiosFollowHalJson);
    mockAxios.create.mockReturnValue(mockAxiosInstance);


    const result: AxiosInstance = axiosInstanceFactory(mockAxios);

    expect(mockAxios.create).toHaveBeenCalledTimes(1);
    expect(mockAxiosFollowHalJsonFunctionFactory).toHaveBeenCalledWith(mockAxiosInstance);
    expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalledWith(mockAxiosFollowHalJson);
    expect(result).toBe(mockAxiosInstance);
  });
});

describe("axiosHttpClientFactory", () => {

  let mockAxiosInstance: AxiosInstance;
  let mockGenerateRequestId = jest.fn();
  let mockBuildTraceparentHeader = jest.fn();
  let mockMergeConfigs = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();

    mockMergeConfigs.mockReturnValue({});

    mockAxiosInstance = {
      request: jest.fn()
    } as unknown as AxiosInstance;
  });


  let context: DvelopContext;
  let config: DvelopHttpRequestConfig;
  let axiosClient: DvelopHttpClient;

  beforeEach(() => {
    axiosClient = axiosHttpClientFactory(mockAxiosInstance, mockGenerateRequestId, mockBuildTraceparentHeader, mockMergeConfigs);
  });

  it("should have default config on empty context", async () => {

    context = {};

    await axiosClient.request(context, {});

    expect(mockMergeConfigs).toHaveBeenCalledWith({
      headers: {
        "ContentType": "application/json",
        "Accept": "application/hal+json, application/json"
      }
    }, {});
  });

  it("should set systemBaseUri as baseURL", async () => {

    context = {
      systemBaseUri: "HiItsMeSystemBaseUri"
    };

    await axiosClient.request(context, {});

    expect(mockMergeConfigs).toHaveBeenCalledWith(expect.objectContaining({
      baseURL: context.systemBaseUri
    }), {});
  });

  it("should set authSessionId as Bearer-Token", async () => {

    context = {
      authSessionId: "HiItsMeAuthSessionId"
    };

    await axiosClient.request(context, {});

    expect(mockMergeConfigs).toHaveBeenCalledWith(expect.objectContaining({
      headers: expect.objectContaining({
        "Authorization": `Bearer ${context.authSessionId}`
      })
    }), {});
  });

  it("should set requestId as header", async () => {

    context = {
      requestId: "HiItsMeRequestId"
    };

    await axiosClient.request(context, {});

    expect(mockMergeConfigs).toHaveBeenCalledWith(expect.objectContaining({
      headers: expect.objectContaining({
        [DVELOP_REQUEST_ID_HEADER]: context.requestId
      })
    }), {});
  });

  it("should generate requestId if non given", async () => {

    context = {};
    const requestId: string = "HiItsMeRequestId";
    mockGenerateRequestId.mockReturnValue(requestId);

    await axiosClient.request(context, {});

    expect(mockGenerateRequestId).toHaveBeenCalledTimes(1);
    expect(mockMergeConfigs).toHaveBeenCalledWith(expect.objectContaining({
      headers: expect.objectContaining({
        [DVELOP_REQUEST_ID_HEADER]: requestId
      })
    }), {});
  });

  it("should build traceparent-Header on traceContext", async () => {

    const traceContext: TraceContext = { traceId: "trace", spanId: "span", version: 0, sampled: true };
    const traceParentHeader: string = "someTraceParentHeader";
    context = {
      traceContext: traceContext
    };
    mockBuildTraceparentHeader.mockReturnValue(traceParentHeader);

    await axiosClient.request(context, {});

    expect(mockBuildTraceparentHeader).toHaveBeenCalledTimes(1);
    expect(mockBuildTraceparentHeader).toHaveBeenCalledWith(traceContext);

    expect(mockMergeConfigs).toHaveBeenCalledWith(expect.objectContaining({
      headers: expect.objectContaining({
        [TRACEPARENT_HEADER]: traceParentHeader
      })
    }), {});
  });

  it("should merge configs", async () => {

    config = {
      method: "GET",
      data: "HiItsMeData"
    };

    await axiosClient.request({}, config);

    expect(mockMergeConfigs).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      method: config.method,
      data: config.data
    }));
  });

  it("should fire request with merged config", async () => {

    const mergedConfig = {
      hi: "itsMeTest"
    };

    mockMergeConfigs.mockReturnValue(mergedConfig);

    await axiosClient.request({}, config);
    expect(mockAxiosInstance.request).toHaveBeenCalledTimes(1);
    expect(mockAxiosInstance.request).toHaveBeenCalledWith(mergedConfig);
  });
});