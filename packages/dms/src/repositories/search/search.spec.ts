import axios, { AxiosResponse } from "axios";
import { search, SearchResult, UnauthorizedError } from "../../index";

jest.mock("axios");

describe("search", () => {

  const mockedAxios = axios as jest.Mocked<typeof axios>;

  beforeEach(() => {
    mockedAxios.get.mockReset();
  });

  describe("axios-params", () => {

    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({
        data: {
          repositoryId: "HiItsMeRepositoryId",
          repositoryName: "HiItsMeRepsitoryName"
        }
      });
    });

    it("should send GET", async () => {
      await search("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", {
        repositoryId: "HiItsMeRepositoryId"
      });
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it("should send to /dms", async () => {
      await search("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", {
        repositoryId: "HiItsMeRepositoryId"
      });
      expect(mockedAxios.get).toHaveBeenCalledWith("/dms", expect.any(Object));
    });

    it("should send with systemBaseUri as BaseURL", async () => {
      const systemBaseUri: string = "HiItsMeSystemBaseUri";
      await search(systemBaseUri, "HiItsMeAuthSessionId", {
        repositoryId: "HiItsMeRepositoryId"
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        baseURL: systemBaseUri
      }));
    });

    it("should send with authSessionId as Authorization-Header", async () => {
      const authSessionId: string = "HiItsMeAuthSessionId";
      await search("HiItsMeSystemBaseUri", authSessionId, {
        repositoryId: "HiItsMeRepositoryId"
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        headers: expect.objectContaining({ "Authorization": `Bearer ${authSessionId}` })
      }));
    });

    it("should send with follows: login", async () => {
      await search("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", {
        repositoryId: "HiItsMeRepositoryId"
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        follows: ["repo", "searchresult"]
      }));
    });

    it("should send with templates: repositoryid", async () => {
      const repositoryId: string = "HiItsMeRepositoryId";
      await search("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", {
        repositoryId: repositoryId
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        templates: { "repositoryid": repositoryId }
      }));
    });

    it("should send with templates: fulltext", async () => {
      const fulltext: string = "HiItsMeFulltext";
      await search("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", {
        repositoryId: "HiItsMeRepositoryId",
        fulltext: fulltext
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        templates: expect.objectContaining({ "fulltext": fulltext })
      }));
    });
  });

  describe("response", () => {

    it("should return repository", async () => {

      const data: SearchResult = {
        repositoryId: "HiItsMeRepositoryId",
        repositoryName: "HiItsMeRepsitoryName"
      };

      mockedAxios.get.mockResolvedValue({ data });

      const result: SearchResult = await search("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", {
        repositoryId: "HiItsMeRepositoryId"
      });
      expect(result).toEqual(data);
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
        await search("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", {
          repositoryId: "HiItsMeRepositoryId"
        });
      } catch (e) {
        error = e;
      }

      expect(error instanceof UnauthorizedError).toBeTruthy();
      expect(error.message).toContain("Failed to search repository:");
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
        await search("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId", {
          repositoryId: "HiItsMeRepositoryId"
        });
      } catch (e) {
        resultError = e;
      }

      expect(resultError).toBe(error);
      expect(resultError.message).toContain(errorString);
      expect(resultError.message).toContain("Failed to search repository:");
    });
  });
});