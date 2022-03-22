import { BadInputError, DvelopContext, DvelopHttpClient, DvelopHttpError, DvelopHttpRequestConfig, DvelopHttpResponse, DvelopSdkError, ForbiddenError, NotFoundError, UnauthorizedError } from "@dvelop-sdk/core";
import { _defaultHttpRequestFunctionFactory, BusinessObjectsError, NotImplementedError } from "./http";

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

    describe("on statusCode 4XX", () => {

      [400, 409, 413, 414, 429, 431].forEach(status => {
        it(`should throw BadInputError on BusinessObjectsErrorDto and status:${status}`, async () => {

          const error: DvelopHttpError = {
            response: {
              status: status,
              data: {
                error: {
                  code: "HiItsMeErrorCode",
                  message: "HiItsMeErrorMessage",
                  details: [{
                    code: "HiItsMeDetail1Code",
                    message: "HiItsMeDetail1Message"
                  }, {
                    code: "HiItsMeDetail2Code",
                    message: "HiItsMeDetail2Message"
                  }]
                }
              }
            } as DvelopHttpResponse,
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
          expect(expectedError.message).toContain((error.response.data as any).error.code);
          expect(expectedError.message).toContain((error.response.data as any).error.message);
          expect(expectedError.message).toContain((error.response.data as any).error.details[0].code);
          expect(expectedError.message).toContain((error.response.data as any).error.details[0].message);
          expect(expectedError.message).toContain((error.response.data as any).error.details[1].code);
          expect(expectedError.message).toContain((error.response.data as any).error.details[1].message);
          expect(expectedError.originalError).toBe(error);
        });

        it("should throw generic BadInputError on missing BusinessObjectsErrorDto", async () => {

          const error: DvelopHttpError = {
            response: {
              status: status
            } as DvelopHttpResponse,
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
          expect(expectedError.message).toEqual("BusinessObjects-App responded with Status 400 indicating bad Request-Parameters. See 'originalError'-property for details.");
          expect(expectedError.originalError).toBe(error);
        });
      });
    });

    describe("on statusCode 401", () => {

      it("should throw Unauthorized on BusinessObjectsErrorDto", async () => {

        const error: DvelopHttpError = {
          response: {
            status: 401,
            data: {
              error: {
                code: "HiItsMeErrorCode",
                message: "HiItsMeErrorMessage",
                details: []
              }
            }
          } as DvelopHttpResponse,
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
        expect(expectedError.message).toContain((error.response.data as any).error.code);
        expect(expectedError.message).toContain((error.response.data as any).error.message);
        expect(expectedError.originalError).toBe(error);
      });

      it("should throw Unauthorized on body", async () => {

        const error: DvelopHttpError = {
          response: {
            status: 401,
            data: "HiItsMeErrorReason"
          } as DvelopHttpResponse,
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

      it("should throw generic BusinessObjectsError on missing Body", async () => {

        const error: DvelopHttpError = {
          response: {
            status: 401
          } as DvelopHttpResponse,
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
        expect(expectedError.message).toEqual("BusinessObjects-App responded with Status 401 indicating bad authSessionId.");
        expect(expectedError.originalError).toBe(error);
      });
    });

    describe("on statusCode 403", () => {

      it("should throw ForbiddenError on BusinessObjectsErrorDto", async () => {

        const error: DvelopHttpError = {
          response: {
            status: 403,
            data: {
              error: {
                code: "HiItsMeErrorCode",
                message: "HiItsMeErrorMessage"
              }
            }
          } as DvelopHttpResponse,
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
        expect(expectedError.message).toContain((error.response.data as any).error.code);
        expect(expectedError.message).toContain((error.response.data as any).error.message);
        expect(expectedError.originalError).toBe(error);
      });

      it("should throw generic ForbiddenError on missing BusinessObjectsErrorDto", async () => {

        const error: DvelopHttpError = {
          response: {
            status: 403
          } as DvelopHttpResponse,
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
        expect(expectedError.message).toEqual("BusinessObjects-App responded with Status 403 indicating a forbidden action. See 'originalError'-property for details.");
        expect(expectedError.originalError).toBe(error);
      });
    });

    describe("on statusCode 404", () => {

      it("should throw NotFoundError on BusinessObjectsErrorDto", async () => {

        const error: DvelopHttpError = {
          response: {
            status: 404,
            data: {
              error: {
                code: "HiItsMeErrorCode",
                message: "HiItsMeErrorMessage"
              }
            }
          } as DvelopHttpResponse,
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
        expect(expectedError.message).toContain((error.response.data as any).error.code);
        expect(expectedError.message).toContain((error.response.data as any).error.message);
        expect(expectedError.originalError).toBe(error);
      });

      it("should throw generic BadInputError on missing BusinessObjectsErrorDto", async () => {

        const error: DvelopHttpError = {
          response: {
            status: 404
          } as DvelopHttpResponse,
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
        expect(expectedError.message).toEqual("BusinessObjects-App responded with Status 404 indicating a requested resource does not exist. See 'originalError'-property for details.");
        expect(expectedError.originalError).toBe(error);
      });
    });

    describe("on statusCode 501", () => {

      it("should throw NotImplemented on BusinessObjectsErrorDto", async () => {

        const error: DvelopHttpError = {
          response: {
            status: 501,
            data: {
              error: {
                code: "HiItsMeErrorCode",
                message: "HiItsMeErrorMessage"
              }
            }
          } as DvelopHttpResponse,
        } as DvelopHttpError;

        mockRequestFunction.mockRejectedValue(error);


        const requestFunction = _defaultHttpRequestFunctionFactory(mockHttpClient);
        let expectedError: DvelopSdkError;
        try {
          await requestFunction(context, config);
        } catch (e: any) {
          expectedError = e;
        }

        expect(expectedError instanceof NotImplementedError).toBeTruthy();
        expect(expectedError.message).toContain((error.response.data as any).error.code);
        expect(expectedError.message).toContain((error.response.data as any).error.message);
        expect(expectedError.originalError).toBe(error);
      });

      it("should throw generic NotImplemented on missing BusinessObjectsErrorDto", async () => {

        const error: DvelopHttpError = {
          response: {
            status: 501
          } as DvelopHttpResponse,
        } as DvelopHttpError;

        mockRequestFunction.mockRejectedValue(error);


        const requestFunction = _defaultHttpRequestFunctionFactory(mockHttpClient);
        let expectedError: DvelopSdkError;
        try {
          await requestFunction(context, config);
        } catch (e: any) {
          expectedError = e;
        }

        expect(expectedError instanceof NotImplementedError).toBeTruthy();
        expect(expectedError.message).toEqual("BusinessObjects-App responded with Status 501 indicating a requested feature is not implemented. See 'originalError'-property for details.");
        expect(expectedError.originalError).toBe(error);
      });
    });

    describe("on unknown statusCode", () => {

      it("should throw BusinessObjectsError on BusinessObjectsErrorDto", async () => {

        const error: DvelopHttpError = {
          response: {
            status: 500,
            data: {
              error: {
                code: "HiItsMeErrorCode",
                message: "HiItsMeErrorMessage"
              }
            }
          } as DvelopHttpResponse,
        } as DvelopHttpError;

        mockRequestFunction.mockRejectedValue(error);


        const requestFunction = _defaultHttpRequestFunctionFactory(mockHttpClient);
        let expectedError: DvelopSdkError;
        try {
          await requestFunction(context, config);
        } catch (e: any) {
          expectedError = e;
        }

        expect(expectedError instanceof BusinessObjectsError).toBeTruthy();
        expect(expectedError.message).toContain((error.response.data as any).error.code);
        expect(expectedError.message).toContain((error.response.data as any).error.message);
        expect(expectedError.originalError).toBe(error);
      });

      it("should throw generic BusinessObjectsError on missing BusinessObjectsErrorDto", async () => {

        const error: DvelopHttpError = {
          response: {
            status: 500
          } as DvelopHttpResponse,
        } as DvelopHttpError;

        mockRequestFunction.mockRejectedValue(error);


        const requestFunction = _defaultHttpRequestFunctionFactory(mockHttpClient);
        let expectedError: DvelopSdkError;
        try {
          await requestFunction(context, config);
        } catch (e: any) {
          expectedError = e;
        }

        expect(expectedError instanceof BusinessObjectsError).toBeTruthy();
        expect(expectedError.message).toEqual(`BusinessObjects-App responded with status ${error.response.status}. See 'originalError'-property for details.`);
        expect(expectedError.originalError).toBe(error);
      });
    });




    it("should throw generic BusinessObjectsError on no response", async () => {
      const error = new Error("HiItsMeError");
      mockRequestFunction.mockRejectedValue(error);


      const requestFunction = _defaultHttpRequestFunctionFactory(mockHttpClient);
      let expectedError: DvelopSdkError;
      try {
        await requestFunction(context, config);
      } catch (e: any) {
        expectedError = e;
      }

      expect(expectedError instanceof BusinessObjectsError).toBeTruthy();
      expect(expectedError.message).toEqual(`Request to BusinessObjects-App failed: ${error.message}. See 'originalError'-property for details.`);
      expect(expectedError.originalError).toBe(error);
    });


  });

});