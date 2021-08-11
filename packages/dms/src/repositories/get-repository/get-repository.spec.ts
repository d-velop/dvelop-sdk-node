import axios, { AxiosResponse } from "axios";
import { getRepository, UnauthorizedError, RepositoryNotFoundError, _internals } from "../../index";

jest.mock("axios");

describe("getRepository", () => {

  const mockedAxios = axios as jest.Mocked<typeof axios>;

  beforeEach(() => {
    mockedAxios.get.mockReset();
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
      await getRepository("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", "HiItsMeRepoId", (_) => { });
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it("should send to /dms", async () => {
      await getRepository("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", "HiItsMeRepoId", (_) => { });
      expect(mockedAxios.get).toHaveBeenCalledWith("/dms", expect.any(Object));
    });

    it("should send with systemBaseUri as BaseURL", async () => {
      const systemBaseUri: string = "HiItsMeSystemBaseUri";
      await getRepository(systemBaseUri, "HiItsMeAuthSessionId", "HiItsMeRepoId", (_) => { });
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        baseURL: systemBaseUri
      }));
    });

    it("should send with authSessionId as Authorization-Header", async () => {
      const authSessionId: string = "HiItsMeAuthSessionId";
      await getRepository("HiItsMeSystemBaseUri", authSessionId, "HiItsMeRepoId", (_) => { });
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        headers: expect.objectContaining({ "Authorization": `Bearer ${authSessionId}` })
      }));
    });

    it("should send with follows: login", async () => {
      await getRepository("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", "HiItsMeRepoId", (_) => { });
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        follows: ["repo"]
      }));
    });

    it("should send with templates: repositoryid", async () => {
      const repositoryId: string = "HiItsMeRepositoryId";
      await getRepository("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", repositoryId, (_) => { });
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        templates: { "repositoryid": repositoryId }
      }));
    });
  });

  describe("transform", () => {

    it("should return transform-result", async () => {

      const dto = { test: "HiItsMeTest" };
      mockedAxios.get.mockResolvedValue({ data: dto });
      const transformResult = "HiItsMeTransformResult";
      const mockedTransform = jest.fn().mockReturnValue(transformResult);


      const result = await getRepository("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", "HiItsMeRepoId", mockedTransform);

      expect(mockedTransform).toHaveBeenCalledTimes(1);
      expect(mockedTransform).toHaveBeenCalledWith(dto);
      expect(result).toBe(transformResult);
    });
  });

  describe("errors", () => {

    it("should throw UnauthorizesError on status 401", async () => {

      const response: AxiosResponse = {
        status: 401,
      } as AxiosResponse;

      mockedAxios.get.mockRejectedValue({ response });

      let error: UnauthorizedError;
      try {
        await getRepository("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", "HiItsMeRepoId");
      } catch (e) {
        error = e;
      }

      expect(error instanceof UnauthorizedError).toBeTruthy();
      expect(error.message).toContain("Failed to get repository:");
      expect(error.response).toEqual(response);
    });

    it("should throw RepositoryNotFoundError on status 404", async () => {

      const repositoryId: string = "HiItsMeRepoId";
      const response: AxiosResponse = {
        status: 404,
      } as AxiosResponse;

      mockedAxios.get.mockRejectedValue({ response });

      let error: RepositoryNotFoundError;
      try {
        await getRepository("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", repositoryId);
      } catch (e) {
        error = e;
      }

      expect(error instanceof RepositoryNotFoundError).toBeTruthy();
      expect(error.message).toContain("Failed to get repository:");
      expect(error.repositoryId).toEqual(repositoryId);
      expect(error.response).toEqual(response);
    });

    it("should throw UnknownErrors", async () => {

      const errorString: string = "HiItsMeError";
      const error: Error = new Error(errorString);
      mockedAxios.get.mockImplementation(() => {
        throw error;
      });

      let resultError: Error;
      try {
        await getRepository("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", "HiItsMeRepoId");
      } catch (e) {
        resultError = e;
      }

      expect(resultError).toBe(error);
      expect(resultError.message).toContain(errorString);
      expect(resultError.message).toContain("Failed to get repository:");
    });
  });
});

describe("transformRepositoryDtoToRepository", () => {
  it("should map values", () => {
    const dto: _internals.RepositoryDto = {
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

    const result = _internals.transformRepositoryDtoToRepository(dto);

    expect(result.id).toEqual(dto.id);
    expect(result.name).toEqual(dto.name);
    expect(result.sourceId).toEqual(dto._links["source"].href);
  });
});