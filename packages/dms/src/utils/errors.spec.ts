import { AxiosError, AxiosResponse } from "axios";
import { BadInputError, DmsAppErrorDto, DmsError, ForbiddenError, NotFoundError, UnauthorizedError } from "./errors";
import { isAxiosError } from "./http";


jest.mock("./http");
const mockIsAxiosError = isAxiosError as jest.MockedFunction<typeof isAxiosError>;

let errorContext: string;
let axiosErrorReason: string;
let axiosError: AxiosError<DmsAppErrorDto>;
let genericErrorMessage: string;
let genericError: Error;
let customErrorMessage: string;


describe("errors", () => {

  beforeEach(() => {
    jest.resetAllMocks();

    errorContext = "HiItsMeErrorContext";

    axiosErrorReason = "HiItsMeAxiosErrorReason";
    axiosError = {
      message: genericErrorMessage,
      response: {
        data: {
          reason: axiosErrorReason
        }
      } as AxiosResponse
    } as AxiosError;

    genericErrorMessage = "HiItsMeOriginalErrorMessage";
    genericError = new Error(genericErrorMessage);

    customErrorMessage = "HiItsMeCustomErrorMessage";
  });

  [
    { ctor: () => new DmsError(errorContext, undefined, customErrorMessage) },
    { ctor: () => new DmsError(errorContext, axiosError, customErrorMessage) },
    { ctor: () => new DmsError(errorContext, genericError, customErrorMessage) },
    { ctor: () => new BadInputError(errorContext, undefined, customErrorMessage) },
    { ctor: () => new BadInputError(errorContext, axiosError, customErrorMessage) },
    { ctor: () => new BadInputError(errorContext, genericError, customErrorMessage) },
    { ctor: () => new UnauthorizedError(errorContext, undefined, customErrorMessage) },
    { ctor: () => new UnauthorizedError(errorContext, axiosError, customErrorMessage) },
    { ctor: () => new UnauthorizedError(errorContext, genericError, customErrorMessage) },
    { ctor: () => new ForbiddenError(errorContext, undefined, customErrorMessage) },
    { ctor: () => new ForbiddenError(errorContext, axiosError, customErrorMessage) },
    { ctor: () => new ForbiddenError(errorContext, genericError, customErrorMessage) },
    { ctor: () => new NotFoundError(errorContext, undefined, customErrorMessage) },
    { ctor: () => new NotFoundError(errorContext, axiosError, customErrorMessage) },
    { ctor: () => new NotFoundError(errorContext, genericError, customErrorMessage) }
  ].forEach(testCase => {
    it("should format message to context: message if message is given", () => {
      const result: Error = testCase.ctor();
      expect(result.message).toEqual(`${errorContext}: ${customErrorMessage}`);
      expect(mockIsAxiosError).toHaveBeenCalledTimes(0);
    });
  });

  [
    { ctor: () => new DmsError(errorContext, axiosError) },
    { ctor: () => new BadInputError(errorContext, axiosError) },
    { ctor: () => new UnauthorizedError(errorContext, axiosError) },
    { ctor: () => new ForbiddenError(errorContext, axiosError) },
    { ctor: () => new NotFoundError(errorContext, axiosError) },
  ].forEach(testCase => {
    it("should format message to context: axiosErrorReason if isAxiosError is true and response contains a reason", () => {
      mockIsAxiosError.mockReturnValue(true);
      const result: Error = testCase.ctor();
      expect(mockIsAxiosError).toHaveBeenCalledTimes(1);
      expect(result.message).toEqual(`${errorContext}: ${axiosErrorReason}`);
    });
  });


  [
    { ctor: () => new DmsError(errorContext, axiosError) },
    { ctor: () => new DmsError(errorContext, genericError) },
    { ctor: () => new BadInputError(errorContext, axiosError) },
    { ctor: () => new BadInputError(errorContext, genericError) },
    { ctor: () => new UnauthorizedError(errorContext, axiosError) },
    { ctor: () => new UnauthorizedError(errorContext, genericError) },
    { ctor: () => new ForbiddenError(errorContext, axiosError) },
    { ctor: () => new ForbiddenError(errorContext, genericError) },
    { ctor: () => new NotFoundError(errorContext, axiosError) },
    { ctor: () => new NotFoundError(errorContext, genericError) }
  ].forEach(testCase => {
    it("should format message to context: errorMessage if isAxiosError is false", () => {
      mockIsAxiosError.mockReturnValue(false);
      const result: Error = testCase.ctor();
      expect(mockIsAxiosError).toHaveBeenCalledTimes(1);
      expect(result.message).toEqual(`${errorContext}: ${genericErrorMessage}`);
    });
  });

  [
    { ctor: () => new DmsError(errorContext, genericError) },
    { ctor: () => new BadInputError(errorContext, genericError) },
    { ctor: () => new UnauthorizedError(errorContext, genericError) },
    { ctor: () => new ForbiddenError(errorContext, genericError) },
    { ctor: () => new NotFoundError(errorContext, genericError) }
  ].forEach(testCase => {
    it("should format message to context: errorMessage if isAxiosError is true but Error has to response object", () => {
      mockIsAxiosError.mockReturnValue(true);
      const result: Error = testCase.ctor();
      expect(mockIsAxiosError).toHaveBeenCalledTimes(1);
      expect(result.message).toEqual(`${errorContext}: ${genericErrorMessage}`);
    });
  });

  [
    { ctor: () => new DmsError(errorContext) },
    { ctor: () => new BadInputError(errorContext) },
    { ctor: () => new UnauthorizedError(errorContext) },
    { ctor: () => new ForbiddenError(errorContext) },
    { ctor: () => new NotFoundError(errorContext) }
  ].forEach(testCase => {
    it("should just set context as message if not message and not error", () => {
      const result: Error = testCase.ctor();
      expect(mockIsAxiosError).toHaveBeenCalledTimes(0);
      expect(result.message).toEqual(errorContext);
    });

    it("should be instance of Error", () => {
      const result: Error = testCase.ctor();
      expect(result instanceof Error).toBeTruthy();
      expect(result instanceof DmsError).toBeTruthy();
    });

    [true, false].forEach(isAxiosErr => {
      it("should call isAxiosError from http", () => {
        const err = testCase.ctor();
        mockIsAxiosError.mockReset();
        mockIsAxiosError.mockReturnValue(isAxiosErr);

        const result: boolean = err.isAxiosError();
        expect(mockIsAxiosError).toHaveBeenCalledTimes(1);
        expect(result).toBe(isAxiosErr);
      });
    });

  });

});