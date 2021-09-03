import axios, { AxiosError, AxiosInstance } from "axios";
import { BadInputError, DmsError, UnauthorizedError } from "./errors";
import { getAxiosInstance, mapRequestError, setAxiosFactory } from "./http";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

jest.mock("./errors");
const mockUnauthorizedError = UnauthorizedError as jest.MockedClass<typeof UnauthorizedError>;
const mockBadInputError = BadInputError as jest.MockedClass<typeof BadInputError>;
const mockDmsError = DmsError as jest.MockedClass<typeof DmsError>;

describe("http", () => {

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("axiosInstance", () => {

    beforeEach(() => {
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

  describe("mapRequestError", () => {

    [[], [401], [400, 404]].forEach(testCase => {
      it("should map to UnauthorizesError on status 401 regardless of expected", () => {
        const errorContext = "HiItsMeErrorContext";
        const error: AxiosError = {
          response: {
            status: 401
          }
        } as AxiosError;
        mockedAxios.isAxiosError.mockReturnValue(true);

        const result: Error = mapRequestError(testCase, errorContext, error);

        expect(mockUnauthorizedError).toHaveBeenCalledTimes(1);
        expect(mockUnauthorizedError).toHaveBeenCalledWith(errorContext, error);
        expect(result instanceof UnauthorizedError).toBeTruthy();
      });
    });

    it("should map to BadInputError on status 400 if mapped", () => {
      const errorContext = "HiItsMeErrorContext";
      const error: AxiosError = {
        response: {
          status: 400
        }
      } as AxiosError;
      mockedAxios.isAxiosError.mockReturnValue(true);

      const result: Error = mapRequestError([400, 404], errorContext, error);

      expect(mockBadInputError).toHaveBeenCalledTimes(1);
      expect(mockBadInputError).toHaveBeenCalledWith(errorContext, error);
      expect(result instanceof BadInputError).toBeTruthy();
    });


    it("should transform to DmsError on unmapped status", () => {
      const errorContext = "HiItsMeErrorContext";
      const error: AxiosError = {
        response: {
          status: 500
        }
      } as AxiosError;
      mockedAxios.isAxiosError.mockReturnValue(true);

      const result: Error = mapRequestError([500], errorContext, error);

      expect(mockDmsError).toHaveBeenCalledTimes(1);
      expect(mockDmsError).toHaveBeenCalledWith(errorContext, error);
      expect(result instanceof DmsError).toBeTruthy();
    });

    [
      { status: 400, expectedStatusCodes: [] },
      { status: 400, expectedStatusCodes: [404] },
      { status: 400, expectedStatusCodes: [402, 403, 404] }
    ].forEach(testCase => {

      it("should transform to DmsError on unexpected status", () => {
        const errorContext = "HiItsMeErrorContext";
        const error: AxiosError = {
          response: {
            status: testCase.status
          }
        } as AxiosError;
        mockedAxios.isAxiosError.mockReturnValue(true);

        const result: Error = mapRequestError(testCase.expectedStatusCodes, errorContext, error);

        expect(mockDmsError).toHaveBeenCalledTimes(1);
        expect(mockDmsError).toHaveBeenCalledWith(errorContext, error);
        expect(result instanceof DmsError).toBeTruthy();
      });
    });

    [null, undefined, {}].forEach(testCase => {
      it("should transform to DmsError on no response", () => {
        const errorContext = "HiItsMeErrorContext";
        const error: AxiosError = {
          response: testCase
        } as AxiosError;
        mockedAxios.isAxiosError.mockReturnValue(true);

        const result: Error = mapRequestError([], errorContext, error);

        expect(mockDmsError).toHaveBeenCalledTimes(1);
        expect(mockDmsError).toHaveBeenCalledWith(errorContext, error);
        expect(result instanceof DmsError).toBeTruthy();
      });
    });


    it("should transform to DmsError on non-AxiosError", () => {
      const errorContext = "HiItsMeErrorContext";
      const error: Error = new Error("HIItsMeError");
      mockedAxios.isAxiosError.mockReturnValue(false);

      const result: Error = mapRequestError([], errorContext, error);

      expect(mockDmsError).toHaveBeenCalledTimes(1);
      expect(mockDmsError).toHaveBeenCalledWith(errorContext, error);
      expect(result instanceof DmsError).toBeTruthy();
    });
  });
});