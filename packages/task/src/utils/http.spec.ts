import { BadInputError, DvelopContext, DvelopHttpClient, DvelopHttpError, DvelopHttpRequestConfig, DvelopHttpResponse, DvelopSdkError, ForbiddenError, NotFoundError, UnauthorizedError } from "@dvelop-sdk/core";
import { _defaultHttpRequestFunctionFactory, TaskError, InvalidTaskDefinitionError } from "./http";

describe("defaultHttpRequestFunctionFactory", () => {

  let mockRequestFunction = jest.fn();
  let mockHttpClient: DvelopHttpClient = {
    request: mockRequestFunction
  };

  let context: DvelopContext;
  let config: DvelopHttpRequestConfig;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should call request", async () => {

    const response: DvelopHttpResponse = {
      data: "HiItsMeResponse"
    } as DvelopHttpResponse;
    mockRequestFunction.mockResolvedValue(response);

    const requestFunction = _defaultHttpRequestFunctionFactory(mockHttpClient);
    const result = await requestFunction(context, config);

    expect(mockRequestFunction).toHaveBeenCalledTimes(1);
    expect(result).toBe(response);
  });

  describe("error-handling", () => {

    describe("on statusCode 400", () => {

      it("should throw InvalidTaskDefinitionError on InvalidTaskDefinitionError", async () => {

        const error: DvelopHttpError = {
          response: {
            status: 400,
            data: {
              "HiItsMeValidation": "HiItsMeValidationError"
            }
          } as DvelopHttpResponse,
        } as DvelopHttpError;

        mockRequestFunction.mockRejectedValue(error);

        const requestFunction = _defaultHttpRequestFunctionFactory(mockHttpClient);
        let expectedError: InvalidTaskDefinitionError;
        try {
          await requestFunction(context, config);
        } catch (e: any) {
          expectedError = e;
        }

        expect(expectedError instanceof InvalidTaskDefinitionError).toBeTruthy();
        expect(expectedError.message).toEqual("Taskdefinition is invalid. See 'validation'-property for more information.");
        expect(expectedError.validation).toEqual(error.response.data);
        expect(expectedError.originalError).toBe(error);
      });

      it("should throw generic BadInputError on missing InvalidTaskDefinitionError", async () => {

        const error: DvelopHttpError = {
          response: {
            status: 400
          } as DvelopHttpResponse,
          message: "HiItsMeHttpError"
        } as DvelopHttpError;

        mockRequestFunction.mockRejectedValue(error);


        const requestFunction = _defaultHttpRequestFunctionFactory(mockHttpClient);
        let expectedError: DvelopSdkError;
        try {
          await requestFunction(context, config);
        } catch (e: any) {
          expectedError = e;
        }

        expect(expectedError instanceof BadInputError).toBeTruthy();
        expect(expectedError.message).toEqual("Task-App responded with Status 400 indicating bad Request-Parameters. See 'originalError'-property for details.");
        expect(expectedError.originalError).toBe(error);
      });
    });

    describe("on statusCode 401", () => {

      it("should throw Unauthorized on body", async () => {

        const error: DvelopHttpError = {
          response: {
            status: 401,
            data: "HiItsMeErrorReason"
          } as DvelopHttpResponse,
          message: "HiItsMeHttpError"
        } as DvelopHttpError;

        mockRequestFunction.mockRejectedValue(error);


        const requestFunction = _defaultHttpRequestFunctionFactory(mockHttpClient);
        let expectedError: UnauthorizedError;
        try {
          await requestFunction(context, config);
        } catch (e: any) {
          expectedError = e;
        }

        expect(expectedError instanceof DvelopSdkError).toBeTruthy();
        expect(expectedError.message).toEqual((error.response.data as any));
        expect(expectedError.originalError).toBe(error);
      });

      it("should throw generic UnauthorizedError on missing Body", async () => {

        const error: DvelopHttpError = {
          response: {
            status: 401
          } as DvelopHttpResponse,
          message: "HiItsMeHttpError"
        } as DvelopHttpError;

        mockRequestFunction.mockRejectedValue(error);


        const requestFunction = _defaultHttpRequestFunctionFactory(mockHttpClient);
        let expectedError: DvelopSdkError;
        try {
          await requestFunction(context, config);
        } catch (e: any) {
          expectedError = e;
        }

        expect(expectedError instanceof UnauthorizedError).toBeTruthy();
        expect(expectedError.message).toEqual("Task-App responded with Status 401 indicating bad authSessionId.");
        expect(expectedError.originalError).toBe(error);
      });
    });

    it("should throw generic ForbiddenError on statusCode 403", async () => {

      const error: DvelopHttpError = {
        response: {
          status: 403
        } as DvelopHttpResponse,
        message: "HiItsMeHttpError"
      } as DvelopHttpError;

      mockRequestFunction.mockRejectedValue(error);


      const requestFunction = _defaultHttpRequestFunctionFactory(mockHttpClient);
      let expectedError: DvelopSdkError;
      try {
        await requestFunction(context, config);
      } catch (e: any) {
        expectedError = e;
      }

      expect(expectedError instanceof ForbiddenError).toBeTruthy();
      expect(expectedError.message).toEqual("Task-App responded with Status 403 indicating a forbidden action. See 'originalError'-property for details.");
      expect(expectedError.originalError).toBe(error);
    });

    it("should throw generic NotFoundError on statusCode 404", async () => {

      const error: DvelopHttpError = {
        response: {
          status: 404
        } as DvelopHttpResponse,
        message: "HiItsMeHttpError"
      } as DvelopHttpError;

      mockRequestFunction.mockRejectedValue(error);


      const requestFunction = _defaultHttpRequestFunctionFactory(mockHttpClient);
      let expectedError: DvelopSdkError;
      try {
        await requestFunction(context, config);
      } catch (e: any) {
        expectedError = e;
      }

      expect(expectedError instanceof NotFoundError).toBeTruthy();
      expect(expectedError.message).toEqual("Task-App responded with Status 404 indicating a requested resource does not exist. See 'originalError'-property for details.");
      expect(expectedError.originalError).toBe(error);
    });

    it("should throw generic TaskError on unknown status code", async () => {

      const error: DvelopHttpError = {
        response: {
          status: 500
        } as DvelopHttpResponse,
        message: "HiItsMeHttpError"
      } as DvelopHttpError;

      mockRequestFunction.mockRejectedValue(error);


      const requestFunction = _defaultHttpRequestFunctionFactory(mockHttpClient);
      let expectedError: DvelopSdkError;
      try {
        await requestFunction(context, config);
      } catch (e: any) {
        expectedError = e;
      }

      expect(expectedError instanceof TaskError).toBeTruthy();
      expect(expectedError.message).toEqual(`Task-App responded with status ${error.response.status}. See 'originalError'-property for details.`);
      expect(expectedError.originalError).toBe(error);
    });

    it("should throw generic TaskError on no response", async () => {
      const error = new Error("HiItsMeError");
      mockRequestFunction.mockRejectedValue(error);


      const requestFunction = _defaultHttpRequestFunctionFactory(mockHttpClient);
      let expectedError: DvelopSdkError;
      try {
        await requestFunction(context, config);
      } catch (e: any) {
        expectedError = e;
      }

      expect(expectedError instanceof TaskError).toBeTruthy();
      expect(expectedError.message).toEqual(`Request to Task-App failed: ${error.message}. See 'originalError'-property for details.`);
      expect(expectedError.originalError).toBe(error);
    });


  });

});