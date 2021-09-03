import axios, { AxiosError, AxiosResponse } from "axios";
import { Context, Repository, getRepositories, UnauthorizedError } from "../../index";
import { DmsAppErrorDto } from "../../utils/errors";

jest.mock("axios");

describe("getRepositories", () => {

  const mockedAxios = axios as jest.Mocked<typeof axios>;
  let context: Context;

  beforeEach(() => {
    context = {
      systemBaseUri: "HiItsMeSystemBaseUri",
      authSessionId: "HiItsMeAuthSessionId"
    };

    mockedAxios.get.mockReset();
    mockedAxios.isAxiosError.mockReset();
  });

  describe("axios-params", () => {

    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({
        data: {
          AuthSessionId: "HiItsMeAuthSessionId",
          Expire: "1992-02-16T16:11:03.8019256Z"
        }
      });
    });

    it("should send GET", async () => {
      await getRepositories(context, (_) => { });
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it("should send to /dms", async () => {
      await getRepositories(context, (_) => { });
      expect(mockedAxios.get).toHaveBeenCalledWith("/dms", expect.any(Object));
    });

    it("should send with systemBaseUri as BaseURL", async () => {
      await getRepositories(context, (_) => { });
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        baseURL: context.systemBaseUri
      }));
    });

    it("should send with authSessionId as Authorization-Header", async () => {
      await getRepositories(context, (_) => { });
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        headers: expect.objectContaining({ "Authorization": `Bearer ${context.authSessionId}` })
      }));
    });

    it("should send with follows: allrepos", async () => {
      await getRepositories(context, (_) => { });
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        follows: ["allrepos"]
      }));
    });
  });


  describe("response", () => {

    describe("default transform", () => {

      it("should call default transform-function with result and return", async () => {

        const dto: any = {
          _links: {},
          count: 50,
          hasAdminRight: true,
          repositories: [
            {
              _links: {
                source: {
                  href: "HiItsMeSourceHref"
                },
                irrelevant: {
                  href: "I'm irrelevant"
                }
              },
              id: "HiItsMeId1",
              name: "HiItsMeRepository1",
              supportsFulltextSearch: true,
              serverId: "HiItsMe",
              available: false,
              isDefault: true,
              version: "HiItsMeVersion"
            },
            {
              _links: {
                source: {
                  href: "HiItsMeSourceHref"
                },
                irrelevant: {
                  href: "I'm irrelevant"
                }
              },
              id: "HiItsMeId1",
              name: "HiItsMeRepository1",
              supportsFulltextSearch: true,
              serverId: "HiItsMe",
              available: false,
              isDefault: true,
              version: "HiItsMeVersion"
            }
          ]
        };

        mockedAxios.get.mockResolvedValue({ data: dto });

        const result: Repository[] = await getRepositories(context);

        expect(result.length).toEqual(dto.repositories.length);

        expect(result[0].id).toEqual(dto.repositories[0].id);
        expect(result[0].name).toEqual(dto.repositories[0].name);
        expect(result[0].sourceId).toEqual(dto.repositories[0]._links["source"].href);

        expect(result[1].id).toEqual(dto.repositories[1].id);
        expect(result[1].name).toEqual(dto.repositories[1].name);
        expect(result[1].sourceId).toEqual(dto.repositories[1]._links["source"].href);
      });
    });

    it("should call given transform-function with result and return", async () => {

      const response: AxiosResponse<any> = {
        data: { test: "HiItsMeTest" }
      } as AxiosResponse;
      mockedAxios.get.mockResolvedValue(response);
      const transformResult = "HiItsMeTransformResult";
      const mockedTransform = jest.fn().mockReturnValue(transformResult);

      const result: Repository[] = await getRepositories(context, mockedTransform);

      expect(mockedTransform).toHaveBeenCalledTimes(1);
      expect(mockedTransform).toHaveBeenCalledWith(response);
      expect(result).toBe(transformResult);
    });
  });

  describe("errors", () => {

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
        await getRepositories(context);
      } catch (e) {
        error = e;
      }

      expect(error instanceof UnauthorizedError).toBeTruthy();
      expect(error.message).toContain("Failed to get repositories:");
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
        await getRepositories(context, (_) => { });
      } catch (e) {
        resultError = e;
      }

      expect(resultError).toBe(requestError);
      expect(resultError.message).toContain(errorString);
      expect(resultError.message).toContain("Failed to get repositories:");
    });

    it("should throw UnknownError on no Response", async () => {

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
        await getRepositories(context, (_) => { });
      } catch (e) {
        resultError = e;
      }

      expect(resultError).toBe(requestError);
      expect(resultError.message).toContain(errorString);
      expect(resultError.message).toContain("Failed to get repositories:");
    });

    it("should throw UnknownErrors", async () => {

      const errorString: string = "HiItsMeError";
      const error: Error = new Error(errorString);
      mockedAxios.get.mockImplementation(() => {
        throw error;
      });

      let resultError: Error;
      try {
        await getRepositories(context);
      } catch (e) {
        resultError = e;
      }

      expect(resultError).toBe(error);
      expect(resultError.message).toContain(errorString);
      expect(resultError.message).toContain("Failed to get repositories:");
    });
  });
});
