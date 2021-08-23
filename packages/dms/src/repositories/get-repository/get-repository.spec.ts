import axios, { AxiosError, AxiosResponse } from "axios";
import { GetRepositoryParams, Repository, getRepository, DmsAppErrorDto, BadRequestError, UnauthorizedError, NotFoundError } from "../../index";
import { TenantContext } from "../../utils/tenant-context";

jest.mock("axios");

describe("getRepository", () => {

  const mockedAxios = axios as jest.Mocked<typeof axios>;
  let context: TenantContext;
  let params: GetRepositoryParams;

  beforeEach(() => {
    context = {
      systemBaseUri: "HiItsMeSystemBaseUri",
      authSessionId: "HiItsMeAuthSessionId"
    };

    params = {
      repositoryId: "HiItsMeRepositoryId"
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
      await getRepository(context, params, (_) => { });
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it("should send to /dms", async () => {
      await getRepository(context, params, (_) => { });
      expect(mockedAxios.get).toHaveBeenCalledWith("/dms", expect.any(Object));
    });

    it("should send with systemBaseUri as BaseURL", async () => {
      await getRepository(context, params, (_) => { });
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        baseURL: context.systemBaseUri
      }));
    });

    it("should send with authSessionId as Authorization-Header", async () => {
      await getRepository(context, params, (_) => { });
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        headers: expect.objectContaining({ "Authorization": `Bearer ${context.authSessionId}` })
      }));
    });

    it("should send with follows: repo", async () => {
      await getRepository(context, params, (_) => { });
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        follows: ["repo"]
      }));
    });

    it("should send with templates: repositoryid", async () => {
      await getRepository(context, params, (_) => { });
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        templates: { "repositoryid": params.repositoryId }
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
          name: "HiItsMe",
          supportsFulltextSearch: true,
          serverId: "HiItsMe",
          available: false,
          isDefault: true,
          version: "HiItsMe"
        };

        mockedAxios.get.mockResolvedValue({ data: dto });

        const result: Repository = await getRepository(context, params);

        expect(result.id).toEqual(dto.id);
        expect(result.name).toEqual(dto.name);
        expect(result.sourceId).toEqual(dto._links["source"].href);
      });
    });

    it("should call given transform-function with result and return", async () => {

      const response: AxiosResponse<any> = {
        data: { test: "HiItsMeTest" }
      } as AxiosResponse;
      mockedAxios.get.mockResolvedValue(response);
      const transformResult = "HiItsMeTransformResult";
      const mockedTransform = jest.fn().mockReturnValue(transformResult);

      const result: Repository = await getRepository(context, params, mockedTransform);

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
        await getRepository(context, params, (_) => { });
      } catch (e) {
        error = e;
      }

      expect(error instanceof BadRequestError).toBeTruthy();
      expect(error.message).toContain("Failed to get repository:");
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
        await getRepository(context, params, (_) => { });
      } catch (e) {
        error = e;
      }

      expect(error instanceof UnauthorizedError).toBeTruthy();
      expect(error.message).toContain("Failed to get repository:");
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
        await getRepository(context, params, (_) => { });
      } catch (e) {
        error = e;
      }

      expect(error instanceof NotFoundError).toBeTruthy();
      expect(error.message).toContain("Failed to get repository:");
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
        await getRepository(context, params, (_) => { });
      } catch (e) {
        resultError = e;
      }

      expect(resultError).toBe(requestError);
      expect(resultError.message).toContain(errorString);
      expect(resultError.message).toContain("Failed to get repository:");
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
        await getRepository(context, params, (_) => { });
      } catch (e) {
        resultError = e;
      }

      expect(resultError).toBe(requestError);
      expect(resultError.message).toContain(errorString);
      expect(resultError.message).toContain("Failed to get repository:");
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
        await getRepository(context, params, (_) => { });
      } catch (e) {
        resultError = e;
      }

      expect(resultError).toBe(error);
      expect(resultError.message).toContain(errorString);
      expect(resultError.message).toContain("Failed to get repository:");
    });
  });
});
