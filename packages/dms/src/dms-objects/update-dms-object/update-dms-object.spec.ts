
import axios, { AxiosError, AxiosResponse } from "axios";
import { TenantContext, UpdateDmsObjectParams, updateDmsObject, DmsAppErrorDto, BadRequestError, UnauthorizedError, NotFoundError } from "../../index";

jest.mock("axios");

describe("updateDmsObject", () => {

  const mockedAxios = axios as jest.Mocked<typeof axios>;
  let context: TenantContext;
  let params: UpdateDmsObjectParams;

  beforeEach(() => {
    context = {
      systemBaseUri: "HiItsMeSystemBaseUri",
      authSessionId: "HiItsMeAuthSessionId"
    };

    params = {
      repositoryId: "HiItsMeRepositoryId",
      sourceId: "HiItsMeSourceId",
      dmsObjectId: "HiItsMeDmsObjectId",
      alterationText: "HiItsMeAlterationText",
      properties: [
        {
          key: "HiItsMePropertyKey2",
          values: ["HiItsMePropertyValue1_1", "HiItsMePropertyValue1_2"]
        }, {
          key: "HiItsMePropertyKey2",
          values: ["HiItsMePropertyValue2_1"]
        }, {
          key: "HiItsMePropertyKey2",
          values: []
        }
      ]
    };

    mockedAxios.put.mockReset();
    mockedAxios.isAxiosError.mockReset();
  });

  describe("axios-params", () => {

    beforeEach(() => {
      mockedAxios.put.mockResolvedValue({});
    });

    it("should send POST", async () => {
      await updateDmsObject(context, params, () => { });
      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
    });

    it("should send to /dms", async () => {
      await updateDmsObject(context, params, () => { });
      expect(mockedAxios.put).toHaveBeenCalledWith("/dms", expect.any(Object), expect.any(Object));
    });

    it("should send with correct body", async () => {
      await updateDmsObject(context, params, () => { });
      expect(mockedAxios.put).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        sourceId: params.sourceId,
        alterationText: params.alterationText,
        sourceProperties: { properties: params.properties }
      }), expect.any(Object));
    });

    it("should send with systemBaseUri as BaseURL", async () => {
      await updateDmsObject(context, params, () => { });
      expect(mockedAxios.put).toHaveBeenCalledWith(expect.any(String), expect.any(Object), expect.objectContaining({
        baseURL: context.systemBaseUri
      }));
    });

    it("should send with correct headers", async () => {
      await updateDmsObject(context, params, () => { });
      expect(mockedAxios.put).toHaveBeenCalledWith(expect.any(String), expect.any(Object), expect.objectContaining({
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
        mockedAxios.put.mockResolvedValue({});
        const result: void = await updateDmsObject(context, params);
        expect(result).toBeFalsy();
      });
    });

    it("should call given transform-function with result and return", async () => {

      const response: AxiosResponse = {
        data: { test: "HiItsMeTest" }
      } as AxiosResponse;
      mockedAxios.put.mockResolvedValue(response);
      const transformResult = "HiItsMeTransformResult";
      const mockedTransform: (response: AxiosResponse)=> string = jest.fn().mockReturnValue(transformResult);

      const result: string = await updateDmsObject<string>(context, params, mockedTransform);

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

      mockedAxios.put.mockRejectedValue(requestError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      let error: BadRequestError;
      try {
        await updateDmsObject(context, params, (_) => { });
      } catch (e) {
        error = e;
      }

      expect(error instanceof BadRequestError).toBeTruthy();
      expect(error.message).toContain("Failed to update dmsObject:");
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

      mockedAxios.put.mockRejectedValue(requestError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      let error: UnauthorizedError;
      try {
        await updateDmsObject(context, params, (_) => { });
      } catch (e) {
        error = e;
      }

      expect(error instanceof UnauthorizedError).toBeTruthy();
      expect(error.message).toContain("Failed to update dmsObject:");
      expect(error.requestError).toEqual(requestError);
    });

    it("should throw NotFoundError on status 404", async () => {

      const requestError: AxiosError = {
        response: {
          status: 404,
          data: {
            reason: "HiItsMeErrorReason"
          }
        }
      } as AxiosError;

      mockedAxios.put.mockRejectedValue(requestError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      let error: NotFoundError;
      try {
        await updateDmsObject(context, params, (_) => { });
      } catch (e) {
        error = e;
      }

      expect(error instanceof NotFoundError).toBeTruthy();
      expect(error.message).toContain("Failed to update dmsObject:");
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

      mockedAxios.put.mockRejectedValue(requestError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      let resultError: AxiosError;
      try {
        await updateDmsObject(context, params, (_) => { });
      } catch (e) {
        resultError = e;
      }

      expect(resultError).toBe(requestError);
      expect(resultError.message).toContain(errorString);
      expect(resultError.message).toContain("Failed to update dmsObject:");
    });

    it("should throw UnknownErrors on no Response", async () => {

      const errorString: string = "HiItsMeError";
      const requestError: AxiosError = {
        message: errorString
      } as AxiosError;

      mockedAxios.put.mockRejectedValue(requestError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      mockedAxios.put.mockImplementation(() => {
        throw requestError;
      });
      mockedAxios.isAxiosError.mockReturnValue(true);

      let resultError: AxiosError;
      try {
        await updateDmsObject(context, params, (_) => { });
      } catch (e) {
        resultError = e;
      }

      expect(resultError).toBe(requestError);
      expect(resultError.message).toContain(errorString);
      expect(resultError.message).toContain("Failed to update dmsObject:");
    });

    it("should throw UnknownErrors on non AxiosError", async () => {

      const errorString: string = "HiItsMeError";
      const error: Error = new Error(errorString);
      mockedAxios.put.mockImplementation(() => {
        throw error;
      });
      mockedAxios.isAxiosError.mockReturnValue(false);

      let resultError: Error;
      try {
        await updateDmsObject(context, params, (_) => { });
      } catch (e) {
        resultError = e;
      }

      expect(resultError).toBe(error);
      expect(resultError.message).toContain(errorString);
      expect(resultError.message).toContain("Failed to update dmsObject:");
    });
  });
});