import axios, { AxiosInstance } from "axios";
import { getAxiosInstance, isAxiosError, setAxiosFactory } from "./http";

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