import axios, { AxiosResponse } from "axios";
import { UnauthorizedError } from "../errors";
import { AuthSession } from "./auth-session";
import { getAuthSession } from "../index";

jest.mock("axios");

describe("getAuthSession", () => {

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
      await getAuthSession("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId");
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it("should send to /identityprovider", async () => {
      await getAuthSession("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId");
      expect(mockedAxios.get).toHaveBeenCalledWith("/identityprovider", expect.any(Object));
    });

    it("should send with systemBaseUri as BaseURL", async () => {
      const systemBaseUri: string = "HiItsMeSystemBaseUri";
      await getAuthSession(systemBaseUri, "HiItsMeAuthSessionId");
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        baseURL: systemBaseUri
      }));
    });

    it("should send with authSessionId as Authorization-Header", async () => {
      const authSessionId: string = "HiItsMeAuthSessionId";
      await getAuthSession("HiItsMeSystemBaseUri", authSessionId);
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        headers: expect.objectContaining({ "Authorization": `Bearer ${authSessionId}` })
      }));
    });

    it("should send with follows: login", async () => {
      await getAuthSession("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId");
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        follows: ["login"]
      }));
    });
  });

  describe("response", () => {

    it("should return AuthSessionId", async () => {

      const authSessionDto = {
        AuthSessionId: "HiItsMeAuthSessionId",
        Expire: "1992-02-16T16:11:03.8019256Z"
      };

      mockedAxios.get.mockResolvedValue({
        data: authSessionDto
      });

      const result: AuthSession = await getAuthSession("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId");
      expect(result.id).toEqual(authSessionDto.AuthSessionId);
    });

    it("should return parsed expireDate", async () => {

      const authSessionDto = {
        AuthSessionId: "HiItsMeAuthSessionId",
        Expire: "1992-02-16T16:11:03.8019256Z"
      };

      mockedAxios.get.mockResolvedValue({
        data: authSessionDto
      });

      const result: AuthSession = await getAuthSession("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId");
      expect(result.expire instanceof Date).toBeTruthy();
      expect(result.expire.getTime()).toEqual(new Date(authSessionDto.Expire).getTime());
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
        await getAuthSession("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId");
      } catch (e) {
        error = e;
      }

      expect(error instanceof UnauthorizedError).toBeTruthy();
      expect(error.message).toContain("Failed to get authSession:");
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
        await getAuthSession("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId");
      } catch (e) {
        resultError = e;
      }

      expect(resultError).toBe(error);
      expect(resultError.message).toContain(errorString);
      expect(resultError.message).toContain("Failed to get authSession:");
    });
  });
});