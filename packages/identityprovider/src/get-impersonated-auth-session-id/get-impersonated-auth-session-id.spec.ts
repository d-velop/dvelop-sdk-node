import axios, { AxiosResponse } from "axios";
import { getImpersonatedAuthSessionId, UnauthorizedError } from "../index";

jest.mock("axios");

describe("getImpersonatedAuthSessionId", () => {

  const mockedAxios = axios as jest.Mocked<typeof axios>;

  beforeEach(() => {
    mockedAxios.get.mockReset();
  });

  describe("axios-params", () => {

    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({
        data: { authSessionId: "HiItsMeAuthSessionId" }
      });
    });

    it("should send GET", async () => {
      await getImpersonatedAuthSessionId("HiItsMeSystemBaseUri", "HiItsMeAppSession", "HiItsMeUserId");
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it("should send to /identityprovider", async () => {
      await getImpersonatedAuthSessionId("HiItsMeSystemBaseUri", "HiItsMeAppSession", "HiItsMeUserId");
      expect(mockedAxios.get).toHaveBeenCalledWith("/identityprovider/impersonatesession", expect.any(Object));
    });

    it("should send with systemBaseUri as BaseURL", async () => {
      const systemBaseUri: string = "HiItsMeSystemBaseUri";
      await getImpersonatedAuthSessionId(systemBaseUri, "HiItsMeAppSession", "HiItsMeUserId");
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        baseURL: systemBaseUri
      }));
    });

    it("should send with authSessionId as Authorization-Header", async () => {
      const appSession: string = "HiItsMeAppSession";
      await getImpersonatedAuthSessionId("HiItsMeSystemBaseUri", appSession, "HiItsMeUserId");
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        headers: expect.objectContaining({ "Authorization": `Bearer ${appSession}` })
      }));
    });

    it("should send with userId as param", async () => {
      const userId: string = "HiItsMeUserId";
      await getImpersonatedAuthSessionId("HiItsMeSystemBaseUri", "HiItsMeAppSession", userId);
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        params: expect.objectContaining({ userId: userId })
      }));
    });
  });

  describe("response", () => {

    it("should return user", async () => {

      const authSessionId: string = "HiItsMeAuthSessionId";

      mockedAxios.get.mockResolvedValue({
        data: {
          authSessionId: authSessionId
        }
      });

      const result: string = await getImpersonatedAuthSessionId("HiItsMeSystemBaseUri", "HiItsMeAppSession", "HiItsMeUserId");
      expect(result).toEqual(authSessionId);
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
        await getImpersonatedAuthSessionId("HiItsMeSystemBaseUri", "HiItsMeAppSession", "HiItsMeUserId");
      } catch (e) {
        error = e;
      }

      expect(error instanceof UnauthorizedError).toBeTruthy();
      expect(error.message).toContain("Failed to impersonate user:");
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
        await getImpersonatedAuthSessionId("HiItsMeSystemBaseUri", "HiItsMeAppSession", "HiItsMeUserId");
      } catch (e) {
        resultError = e;
      }

      expect(resultError).toBe(error);
      expect(resultError.message).toContain(errorString);
      expect(resultError.message).toContain("Failed to impersonate user:");
    });
  });
});