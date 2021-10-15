import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import { followHalJson } from "@dvelop-sdk/axios-hal-json";
import { Context } from "./context";
import { axiosErrorInterceptor, BadInputError, defaultAxiosInstanceFactory, DmsError, ForbiddenError, HttpConfig, httpRequestFunctionFactory, NotFoundError, UnauthorizedError } from "./http";

jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

jest.mock("@dvelop-sdk/axios-hal-json");
const mockFollowHalJson = followHalJson as jest.Mocked<typeof followHalJson>;


describe("http", () => {

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("axiosErrorInterceptor", () => {

    it("should wrap error in DmsError if not an AxiosError", () => {


      const errorMessage: string = "HiItsMeError";
      mockAxios.isAxiosError.mockReturnValue(false);

      let expectedError: any;
      try {
        axiosErrorInterceptor(new Error(errorMessage));
      } catch (e: any) {
        expectedError = e;
      }

      expect(expectedError instanceof DmsError).toBeTruthy();
      expect(expectedError.message).toEqual(`Request to DMS-App failed: ${errorMessage}. See 'originalError'-property for details.`);
    });


    describe("on AxiosError", () => {

      beforeEach(() => {
        mockAxios.isAxiosError.mockReturnValue(true);
      });

      [
        { status: 400, type: BadInputError, defaultMessage: "DMS-App responded with Status 400 indicating bad Request-Parameters. See 'originalError'-property for details." },
        { status: 401, type: UnauthorizedError, defaultMessage: "DMS-App responded with Status 401 indicating bad authSessionId." },
        { status: 403, type: ForbiddenError, defaultMessage: "DMS-App responded with Status 403 indicating a forbidden action. See 'originalError'-property for details." },
        { status: 404, type: NotFoundError, defaultMessage: "DMS-App responded with Status 404 indicating a requested resource does not exist. See 'originalError'-property for details." },
        { status: 500, type: DmsError, defaultMessage: "DMS-App responded with status 500. See 'originalError'-property for details." }
      ].forEach(testCase => {

        it(`should wrap default message on status ${testCase.status} and no reason`, () => {

          const error: AxiosError = {
            response: {
              status: testCase.status
            } as AxiosResponse
          } as AxiosError;

          let expectedError: any;
          try {
            axiosErrorInterceptor(error);
          } catch (e: any) {
            expectedError = e;
          }

          expect(expectedError instanceof testCase.type).toBeTruthy();
          expect(expectedError.message).toEqual(testCase.defaultMessage);
          expect(expectedError.originalError).toEqual(error);
        });

        it(`should wrap message on statis ${testCase.status} if there is a reason`, () => {

          const error: AxiosError = {
            response: {
              status: testCase.status,
              data: {
                reason: "HiItsMeReason"
              }
            } as AxiosResponse
          } as AxiosError;

          let expectedError: any;
          try {
            axiosErrorInterceptor(error);
          } catch (e: any) {
            expectedError = e;
          }

          expect(expectedError instanceof testCase.type).toBeTruthy();
          expect(expectedError.message).toEqual(error.response.data.reason);
          expect(expectedError.originalError).toEqual(error);
        });
      });

    });
  });

  it("should correctly create AxiosInstance", () => {

    const mockAxiosInstance: AxiosInstance = {
      interceptors: {
        request: {
          use: jest.fn()
        },
        response: {
          use: jest.fn()
        }
      }
    } as unknown as AxiosInstance;

    mockAxios.create.mockReturnValue(mockAxiosInstance);

    defaultAxiosInstanceFactory();

    expect(mockAxios.create).toHaveBeenCalledTimes(1);
    expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalledWith(mockFollowHalJson);
    expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalledWith(undefined, expect.any(Function));
  });

  describe("httpRequestFunctionFactory", () => {

    const mockHttpClient = {
      request: jest.fn()
    };

    let context: Context;
    let config: HttpConfig;

    it("should have default config on empty context", async () => {

      context = {};

      const httpRequestFunction = httpRequestFunctionFactory(mockHttpClient);
      await httpRequestFunction(context, {});

      expect(mockHttpClient.request).toHaveBeenCalledWith({
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

      const httpRequestFunction = httpRequestFunctionFactory(mockHttpClient);
      await httpRequestFunction(context, {});

      expect(mockHttpClient.request).toHaveBeenCalledWith(expect.objectContaining({
        baseURL: context.systemBaseUri
      }));
    });

    it("should set authSessionId as Bearer-Token", async () => {

      context = {
        authSessionId: "HiItsMeAuthSessionId"
      };

      const httpRequestFunction = httpRequestFunctionFactory(mockHttpClient);
      await httpRequestFunction(context, {});

      expect(mockHttpClient.request).toHaveBeenCalledWith(expect.objectContaining({
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

      const httpRequestFunction = httpRequestFunctionFactory(mockHttpClient);
      await httpRequestFunction({}, config);

      expect(mockHttpClient.request).toHaveBeenCalledWith(expect.objectContaining({
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

      const httpRequestFunction = httpRequestFunctionFactory(mockHttpClient);
      await httpRequestFunction({}, config);

      expect(mockHttpClient.request).toHaveBeenCalledWith(expect.objectContaining({
        headers: expect.objectContaining({
          "Accept": config.headers["Accept"],
          "test": config.headers["test"]
        })
      }));
    });
  });
});