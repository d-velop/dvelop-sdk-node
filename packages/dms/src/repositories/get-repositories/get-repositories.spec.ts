import axios, { AxiosResponse } from "axios";
import { Repository, getRepositories, UnauthorizedError } from "../../index";

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
      await getRepositories("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId");
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it("should send to /dms", async () => {
      await getRepositories("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId");
      expect(mockedAxios.get).toHaveBeenCalledWith("/dms", expect.any(Object));
    });

    it("should send with systemBaseUri as BaseURL", async () => {
      const systemBaseUri: string = "HiItsMeSystemBaseUri";
      await getRepositories(systemBaseUri, "HiItsMeAuthSessionId");
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        baseURL: systemBaseUri
      }));
    });

    it("should send with authSessionId as Authorization-Header", async () => {
      const authSessionId: string = "HiItsMeAuthSessionId";
      await getRepositories("HiItsMeSystemBaseUri", authSessionId);
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        headers: expect.objectContaining({ "Authorization": `Bearer ${authSessionId}` })
      }));
    });

    it("should send with follows: login", async () => {
      await getRepositories("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId");
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        follows: ["allrepos"]
      }));
    });
  });

  describe("response", () => {

    it("should return repositories", async () => {

      const repositories = [
        { id: "repo1", name: "repository1" },
        { id: "repo2", name: "repository2" }
      ];

      mockedAxios.get.mockResolvedValue({
        data: { repositories }
      });

      const result: Repository[] = await getRepositories("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId");
      expect(result).toEqual(repositories);
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