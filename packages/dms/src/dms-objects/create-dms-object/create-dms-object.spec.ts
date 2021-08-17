import axios, { AxiosError, AxiosResponse } from "axios";
import { TenantContext, CreateDmsObjectParams, createDmsObject, DmsAppErrorDto, BadRequestError, UnauthorizedError } from "../../index";

jest.mock("axios");

describe("createDmsObject", () => {

  const mockedAxios = axios as jest.Mocked<typeof axios>;
  let context: TenantContext;
  let params: CreateDmsObjectParams;

  beforeEach(() => {
    context = {
      systemBaseUri: "HiItsMeSystemBaseUri",
      authSessionId: "HiItsMeAuthSessionId"
    };

    params = {
      repositoryId: "HiItsMeRepositoryId",
      sourceId: "HiItsMeSourceId",
      categoryId: "HiItsMeCategoryId"
    };

    mockedAxios.post.mockReset();
    mockedAxios.isAxiosError.mockReset();
  });

  describe("axios-params", () => {

    beforeEach(() => {
      mockedAxios.post.mockResolvedValue({});
    });

    it("should send POST", async () => {
      await createDmsObject(context, params, (_) => { });
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });

    it("should send to /dms", async () => {
      await createDmsObject(context, params, (_) => { });
      expect(mockedAxios.post).toHaveBeenCalledWith(`/dms/r/${params.repositoryId}/o2m`, expect.any(Object), expect.any(Object));
    });

    it("should send with correct body", async () => {
      await createDmsObject(context, params, (_) => { });
      expect(mockedAxios.post).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        sourceId: params.sourceId,
        sourceCategory: params.categoryId
      }), expect.any(Object));
    });

    it("should send with systemBaseUri as BaseURL", async () => {
      await createDmsObject(context, params, (_) => { });
      expect(mockedAxios.post).toHaveBeenCalledWith(expect.any(String), expect.any(Object), expect.objectContaining({
        baseURL: context.systemBaseUri
      }));
    });

    it("should send with correct headers", async () => {
      await createDmsObject(context, params, (_) => { });
      expect(mockedAxios.post).toHaveBeenCalledWith(expect.any(String), expect.any(Object), expect.objectContaining({
        headers: expect.objectContaining({
          "Authorization": `Bearer ${context.authSessionId}`,
          "Accept": "application/hal+json",
          "Content-Type": "application/hal+json"
        })
      }));
    });
  });



  describe("response", () => {

    describe("default transform", () => {

      it("should call default transform-function with result and return", async () => {
        mockedAxios.post.mockResolvedValue({});
        const result: void = await createDmsObject(context, params);
        expect(result).toBeFalsy();
      });
    });

    it("should call given transform-function with result and return", async () => {

      const response: AxiosResponse = {
        data: { test: "HiItsMeTest" }
      } as AxiosResponse;
      mockedAxios.post.mockResolvedValue(response);
      const transformResult = "HiItsMeTransformResult";
      const mockedTransform: (response: AxiosResponse)=> string = jest.fn().mockReturnValue(transformResult);

      const result: string = await createDmsObject<string>(context, params, mockedTransform);

      expect(mockedTransform).toHaveBeenCalledTimes(1);
      expect(mockedTransform).toHaveBeenCalledWith(response);
      expect(result).toBe(transformResult);
    });
  });

  describe("errors", () => {

    it("should throw BadRequestError on status 400", async () => {

      const requestError = {
        response: {
          status: 400,
          data: {
            reason: "HiItsMeErrorReason"
          }
        }
      } as AxiosError<DmsAppErrorDto>;

      mockedAxios.post.mockRejectedValue(requestError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      let error: BadRequestError;
      try {
        await createDmsObject(context, params, (_) => { });
      } catch (e) {
        error = e;
      }

      expect(error instanceof BadRequestError).toBeTruthy();
      expect(error.message).toContain("Failed to create dmsObject:");
      expect(error.requestError).toEqual(requestError);
    });

    it("should throw UnauthorizesError on status 401", async () => {

      const requestError = {
        response: {
          status: 401,
          data: {
            reason: "HiItsMeErrorReason"
          }
        }
      } as AxiosError<DmsAppErrorDto>;

      mockedAxios.post.mockRejectedValue(requestError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      let error: UnauthorizedError;
      try {
        await createDmsObject(context, params, (_) => { });
      } catch (e) {
        error = e;
      }

      expect(error instanceof UnauthorizedError).toBeTruthy();
      expect(error.message).toContain("Failed to create dmsObject:");
      expect(error.requestError).toEqual(requestError);
    });

    it("should throw UnknownErrors on unmapped statusCode", async () => {

      const errorString: string = "HiItsMeError";
      const requestError: AxiosError = {
        response: {
          status: 500,
        },
        message: errorString
      } as AxiosError;

      mockedAxios.post.mockRejectedValue(requestError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      let resultError: AxiosError;
      try {
        await createDmsObject(context, params, (_) => { });
      } catch (e) {
        resultError = e;
      }

      expect(resultError).toBe(requestError);
      expect(resultError.message).toContain(errorString);
      expect(resultError.message).toContain("Failed to create dmsObject:");
    });

    it("should throw UnknownErrors on no Response", async () => {

      const errorString: string = "HiItsMeError";
      const requestError: AxiosError = {
        message: errorString
      } as AxiosError;

      mockedAxios.post.mockRejectedValue(requestError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      mockedAxios.post.mockImplementation(() => {
        throw requestError;
      });
      mockedAxios.isAxiosError.mockReturnValue(true);

      let resultError: AxiosError;
      try {
        await createDmsObject(context, params, (_) => { });
      } catch (e) {
        resultError = e;
      }

      expect(resultError).toBe(requestError);
      expect(resultError.message).toContain(errorString);
      expect(resultError.message).toContain("Failed to create dmsObject:");
    });

    it("should throw UnknownErrors on non AxiosError", async () => {

      const errorString: string = "HiItsMeError";
      const error: Error = new Error(errorString);
      mockedAxios.post.mockImplementation(() => {
        throw error;
      });
      mockedAxios.isAxiosError.mockReturnValue(false);

      let resultError: Error;
      try {
        await createDmsObject(context, params, (_) => { });
      } catch (e) {
        resultError = e;
      }

      expect(resultError).toBe(error);
      expect(resultError.message).toContain(errorString);
      expect(resultError.message).toContain("Failed to create dmsObject:");
    });
  });
});