import axios, { AxiosError, AxiosResponse } from "axios";
import { TenantContext, GetDmsObjectParams, DmsObject, getDmsObject, DmsAppErrorDto, BadRequestError, UnauthorizedError, NotFoundError } from "../../index";

jest.mock("axios");

describe("getDmsObject", () => {

  const mockedAxios = axios as jest.Mocked<typeof axios>;
  let context: TenantContext;
  let params: GetDmsObjectParams;

  beforeEach(() => {
    context = {
      systemBaseUri: "HiItsMeSystemBaseUri",
      authSessionId: "HiItsMeAuthSessionId"
    };

    params = {
      repositoryId: "HiItsMeRepositoryId",
      sourceId: "HiItsMeSourceId",
      dmsObjectId: "HiItsMeDmsObjectId"
    };

    mockedAxios.get.mockReset();
    mockedAxios.isAxiosError.mockReset();
  });

  describe("axios-params", () => {

    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({
        data: {
          id: "HiItsMeRepositoryId",
          name: "HiItsMeRepsitoryName"
        }
      });
    });

    it("should send GET", async () => {
      await getDmsObject(context, params, (_) => { });
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it("should send to /dms", async () => {
      await getDmsObject(context, params, (_) => { });
      expect(mockedAxios.get).toHaveBeenCalledWith("/dms", expect.any(Object));
    });

    it("should send with systemBaseUri as BaseURL", async () => {
      await getDmsObject(context, params, (_) => { });
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        baseURL: context.systemBaseUri
      }));
    });

    it("should send with authSessionId as Authorization-Header", async () => {
      await getDmsObject(context, params, (_) => { });
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        headers: expect.objectContaining({ "Authorization": `Bearer ${context.authSessionId}` })
      }));
    });

    it("should send with follows: repo, dmsobjectwithmapping", async () => {
      await getDmsObject(context, params, (_) => { });
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        follows: ["repo", "dmsobjectwithmapping"]
      }));
    });

    it("should send with templates: dmsObjectid, dmsobjectid & sourceid", async () => {
      await getDmsObject(context, params, (_) => { });
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        templates: {
          "repositoryid": params.repositoryId,
          "dmsobjectid": params.dmsObjectId,
          "sourceid": params.sourceId
        }
      }));
    });
  });

  describe("response", () => {

    describe("default transform", () => {

      it("should call default transform-function with result and return", async () => {

        const dto: any = {
          _links: {
            source: {
              href: "HiItsMeSourceHref"
            },
            irrelevant: {
              href: "I'm irrelevant"
            }
          },
          id: "HiItsMeId",
          sourceProperties: [
            {
              key: "HiItsMePropertyKey1",
              value: "HiItsMePropertyValue1",
              values: ["HiItsMePropertyValue1_1", "HiItsMePropertyValue1_2"],
              displayValue: "HiItsMeDisplayValue1"
            },
            {
              key: "HiItsMePropertyKey2",
              value: "HiItsMePropertyValue2",
              values: ["HiItsMePropertyValue2_1", "HiItsMePropertyValue2_2"],
              displayValue: "HiItsMeDisplayValue2"
            }
          ],
          sourceCategories: ["HiItsMeCategory1", "HiItsMeCategory2"]
        };

        mockedAxios.get.mockResolvedValue({
          data: dto,
          config: {
            params: {
              "repositoryid": params.repositoryId,
              "sourceid": params.sourceId
            }
          }
        });

        const result: DmsObject = await getDmsObject(context, params);

        expect(result.repositoryId).toEqual(params.repositoryId);
        expect(result.sourceId).toEqual(params.sourceId);
        expect(result.id).toEqual(dto.id);
        expect(result.categories).toEqual(dto.sourceCategories);
        expect(result.properties).toEqual(dto.sourceProperties);
      });
    });

    it("should call given transform-function with result and return", async () => {

      const response: AxiosResponse<any> = {
        data: { test: "HiItsMeTest" }
      } as AxiosResponse;
      mockedAxios.get.mockResolvedValue(response);
      const transformResult = "HiItsMeTransformResult";
      const mockedTransform = jest.fn().mockReturnValue(transformResult);

      const result: DmsObject = await getDmsObject(context, params, mockedTransform);

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

      mockedAxios.get.mockRejectedValue(requestError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      let error: BadRequestError;
      try {
        await getDmsObject(context, params, (_) => { });
      } catch (e) {
        error = e;
      }

      expect(error instanceof BadRequestError).toBeTruthy();
      expect(error.message).toContain("Failed to get dmsObject:");
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

      mockedAxios.get.mockRejectedValue(requestError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      let error: UnauthorizedError;
      try {
        await getDmsObject(context, params, (_) => { });
      } catch (e) {
        error = e;
      }

      expect(error instanceof UnauthorizedError).toBeTruthy();
      expect(error.message).toContain("Failed to get dmsObject:");
      expect(error.requestError).toEqual(requestError);
    });

    it("should throw RepositoryNotFoundError on status 404", async () => {

      const requestError: AxiosError = {
        response: {
          status: 404,
          data: {
            reason: "HiItsMeErrorReason"
          }
        }
      } as AxiosError;

      mockedAxios.get.mockRejectedValue(requestError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      let error: NotFoundError;
      try {
        await getDmsObject(context, params, (_) => { });
      } catch (e) {
        error = e;
      }

      expect(error instanceof NotFoundError).toBeTruthy();
      expect(error.message).toContain("Failed to get dmsObject:");
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

      mockedAxios.get.mockRejectedValue(requestError);
      mockedAxios.isAxiosError.mockReturnValue(true);


      let resultError: AxiosError;
      try {
        await getDmsObject(context, params, (_) => { });
      } catch (e) {
        resultError = e;
      }

      expect(resultError).toBe(requestError);
      expect(resultError.message).toContain(errorString);
      expect(resultError.message).toContain("Failed to get dmsObject:");
    });

    it("should throw UnknownErrors on no Response", async () => {

      const errorString: string = "HiItsMeError";
      const requestError: AxiosError = {
        message: errorString
      } as AxiosError;

      mockedAxios.get.mockRejectedValue(requestError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      mockedAxios.get.mockImplementation(() => {
        throw requestError;
      });
      mockedAxios.isAxiosError.mockReturnValue(true);

      let resultError: AxiosError;
      try {
        await getDmsObject(context, params, (_) => { });
      } catch (e) {
        resultError = e;
      }

      expect(resultError).toBe(requestError);
      expect(resultError.message).toContain(errorString);
      expect(resultError.message).toContain("Failed to get dmsObject:");
    });

    it("should throw UnknownErrors on non AxiosError", async () => {

      const errorString: string = "HiItsMeError";
      const error: Error = new Error(errorString);
      mockedAxios.get.mockImplementation(() => {
        throw error;
      });
      mockedAxios.isAxiosError.mockReturnValue(false);

      let resultError: Error;
      try {
        await getDmsObject(context, params, (_) => { });
      } catch (e) {
        resultError = e;
      }

      expect(resultError).toBe(error);
      expect(resultError.message).toContain(errorString);
      expect(resultError.message).toContain("Failed to get dmsObject:");
    });
  });
});