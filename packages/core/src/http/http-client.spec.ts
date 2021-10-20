import axios, { AxiosInstance } from "axios";
import { DvelopContext } from "../context/context";
import { axiosFollowHalJsonFunctionFactory } from "./axios-follow-hal-json";
import { DvelopHttpClient, DvelopHttpRequestConfig, axiosHttpClientFactory, axiosInstanceFactory } from "./http-client";

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

  beforeEach(() => {
    jest.resetAllMocks();

    mockAxiosInstance = {
      request: jest.fn()
    } as unknown as AxiosInstance;
  });


  let context: DvelopContext;
  let config: DvelopHttpRequestConfig;
  let axiosClient: DvelopHttpClient;

  beforeEach(() => {
    axiosClient = axiosHttpClientFactory(mockAxiosInstance);
  });

  it("should have default config on empty context", async () => {

    context = {};

    await axiosClient.request(context, {});

    expect(mockAxiosInstance.request).toHaveBeenCalledWith({
      headers: {
        "ContentType": "application/json",
        "Accept": "application/hal+json, application/json"
      }
    });
  });

  it("should set systemBaseUri as baseURL", async () => {

    context = {
      systemBaseUri: "HiItsMeSystemBaseUri"
    };

    await axiosClient.request(context, {});

    expect(mockAxiosInstance.request).toHaveBeenCalledWith(expect.objectContaining({
      baseURL: context.systemBaseUri
    }));
  });

  it("should set authSessionId as Bearer-Token", async () => {

    context = {
      authSessionId: "HiItsMeAuthSessionId"
    };

    await axiosClient.request(context, {});

    expect(mockAxiosInstance.request).toHaveBeenCalledWith(expect.objectContaining({
      headers: expect.objectContaining({
        "Authorization": `Bearer ${context.authSessionId}`
      })
    }));
  });

  it("should add config", async () => {

    config = {
      method: "GET",
      data: "HiItsMeData"
    };

    await axiosClient.request({}, config);

    expect(mockAxiosInstance.request).toHaveBeenCalledWith(expect.objectContaining({
      method: config.method,
      data: config.data
    }));
  });

  it("should add and overwrite config-headers", async () => {

    config = {
      headers: {
        "Accept": "HiItsMeAcceptHeader",
        "ContentType": "application/json",
        "test": "HiItsMeTestHeader"
      }
    };

    await axiosClient.request({}, config);

    expect(mockAxiosInstance.request).toHaveBeenCalledWith(expect.objectContaining({
      headers: expect.objectContaining({
        "Accept": config.headers["Accept"],
        "test": config.headers["test"]
      })
    }));
  });
});