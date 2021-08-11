import axios, { AxiosResponse } from "axios";
import { Repository, getRepositories, UnauthorizedError, _internals } from "../../index";

jest.mock("axios");

describe("getRepositories", () => {

  const mockedAxios = axios as jest.Mocked<typeof axios>;

  beforeEach(() => {
    mockedAxios.get.mockReset();
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
      await getRepositories("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", (_) => { });
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it("should send to /dms", async () => {
      await getRepositories("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", (_) => { });
      expect(mockedAxios.get).toHaveBeenCalledWith("/dms", expect.any(Object));
    });

    it("should send with systemBaseUri as BaseURL", async () => {
      const systemBaseUri: string = "HiItsMeSystemBaseUri";
      await getRepositories(systemBaseUri, "HiItsMeAuthSessionId", (_) => { });
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        baseURL: systemBaseUri
      }));
    });

    it("should send with authSessionId as Authorization-Header", async () => {
      const authSessionId: string = "HiItsMeAuthSessionId";
      await getRepositories("HiItsMeSystemBaseUri", authSessionId, (_) => { });
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        headers: expect.objectContaining({ "Authorization": `Bearer ${authSessionId}` })
      }));
    });

    it("should send with follows: login", async () => {
      await getRepositories("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", (_) => { });
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        follows: ["allrepos"]
      }));
    });
  });

  describe("transform", () => {

    it("should return repositories", async () => {


      const dto = { test: "HiItsMeTest" };
      mockedAxios.get.mockResolvedValue({ data: dto });
      const transformResult = "HiItsMeTransformResult";
      const mockedTransform = jest.fn().mockReturnValue(transformResult);

      const result: Repository[] = await getRepositories("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", mockedTransform);

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
        await getRepositories("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId");
      } catch (e) {
        error = e;
      }

      expect(error instanceof UnauthorizedError).toBeTruthy();
      expect(error.message).toContain("Failed to get repositories:");
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
        await getRepositories("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId");
      } catch (e) {
        resultError = e;
      }

      expect(resultError).toBe(error);
      expect(resultError.message).toContain(errorString);
      expect(resultError.message).toContain("Failed to get repositories:");
    });
  });
});

describe("transformRepositoryListDtoToRepositoryArray", () => {
  it("should call transform", async () => {

    const repo1: _internals.RepositoryDto = {
      test: "HiItsMeRepo1Test"
    } as unknown as _internals.RepositoryDto;

    const repo2: _internals.RepositoryDto = {
      test: "HiItsMeRepo2Test"
    } as unknown as _internals.RepositoryDto;

    const repo3: _internals.RepositoryDto = {
      test: "HiItsMeRepo3Test"
    } as unknown as _internals.RepositoryDto;

    const dto: _internals.RepositoryListDto = {
      _links: {
        irrelevant: {
          href: "HiItsMeIrrelevantHref"
        }
      },
      count: 4,
      hasAdminRight: false,
      repositories: [repo1, repo2, repo3]
    };
    const transformResult = "HiItsMeTransformResult";
    const mockedTransform = jest.fn().mockReturnValue(transformResult);

    const result = _internals.transformRepositoryListDtoToRepositoryArray(dto, mockedTransform);

    expect(mockedTransform).toHaveBeenCalledTimes(3);
    expect(mockedTransform).toHaveBeenNthCalledWith(1, repo1);
    expect(mockedTransform).toHaveBeenNthCalledWith(2, repo2);
    expect(mockedTransform).toHaveBeenNthCalledWith(3, repo3);
    expect(result).toEqual([transformResult, transformResult, transformResult]);
  });
});