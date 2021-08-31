import axios, { AxiosError, AxiosInstance } from "axios";
import { BadRequestError, UnauthorizedError, NotFoundError } from "./errors";
import { getAxiosInstance, isAxiosError, mapAxiosError, setAxiosFactory } from "./http";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("axiosInstance", () => {

  beforeEach(() => {
    mockedAxios.create.mockReset();
    setAxiosFactory(null);
  });

  it("should initialize axiosFactory with default factory", () => {

    const mockedAxiosInstance: AxiosInstance = {
      interceptors: {
        request: {
          use: jest.fn()
        }
      }
    } as unknown as AxiosInstance;

    mockedAxios.create.mockReturnValue(mockedAxiosInstance);

    const result = getAxiosInstance();
    expect(result).toBe(mockedAxiosInstance);
    expect(mockedAxiosInstance.interceptors.request.use).toHaveBeenLastCalledWith(expect.any(Function));
  });

  it("should use custom axiosFactory", () => {
    const factory = (() => "axios") as unknown as ()=> AxiosInstance;
    setAxiosFactory(factory);
    expect(getAxiosInstance()).toEqual("axios");
  });
});

describe("isAxiosError", () => {


  beforeEach(() => {
    mockedAxios.isAxiosError.mockReset();
  });


  [true, false].forEach(testCase => {
    it("should call axios.isAxiosError", () => {
      const error = new Error("HiItsMeError");
      mockedAxios.isAxiosError.mockReturnValue(testCase);

      const result = isAxiosError(error);

      expect(result).toBe(testCase);
      expect(axios.isAxiosError).toHaveBeenCalledTimes(1);
      expect(axios.isAxiosError).toHaveBeenCalledWith(error);
    });
  });

});

describe("mapAxiosError", () => {

  const mockedAxios = axios as jest.Mocked<typeof axios>;

  beforeEach(() => {
    mockedAxios.isAxiosError.mockReset();
  });

  it("should map status 400 to BadRequestError", () => {

    const context = "HiItsMeContext";

    const axiosError: AxiosError = {
      response: {
        status: 400
      }
    } as AxiosError;

    const result: Error = mapAxiosError(context, axiosError);

    expect(result instanceof BadRequestError).toBeTruthy();
    expect(result.message).toContain(context);
  });

  it("should map status 401 to UnauthorizedError", () => {

    const context = "HiItsMeContext";

    const axiosError: AxiosError = {
      response: {
        status: 401,
      }
    } as AxiosError;

    const result: Error = mapAxiosError(context, axiosError);

    expect(result instanceof UnauthorizedError).toBeTruthy();
    expect(result.message).toContain(context);
  });

  it("should map status 404 to NotFoundError", () => {

    const context = "HiItsMeContext";

    const axiosError: AxiosError = {
      response: {
        status: 404,
      }
    } as AxiosError;

    const result: Error = mapAxiosError(context, axiosError);

    expect(result instanceof NotFoundError).toBeTruthy();
    expect(result.message).toContain(context);
  });

  [
    null,
    undefined,
    {},
    { status: null },
    { status: undefined },
    { status: 500 }
  ].forEach(testCase => {
    it("should return originalError with context if no status", () => {

      const context = "HiItsMeContext";

      const axiosError: AxiosError = {
        response: testCase
      } as AxiosError;

      const result: Error = mapAxiosError(context, axiosError);

      expect(result).toBe(axiosError);
      expect(result.message).toContain(context);
    });
  });

});