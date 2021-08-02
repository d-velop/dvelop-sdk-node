import axios, { AxiosResponse } from "axios";
import { validateAuthSessionId, ScimUser, ForbiddenError, NotFoundError, UnauthorizedError } from "../../index";

jest.mock("axios");

describe("validateAuthSessionId", () => {

  const mockedAxios = axios as jest.Mocked<typeof axios>;

  beforeEach(() => {
    mockedAxios.get.mockReset();
  });

  describe("axios-params", () => {

    beforeEach(() => {
      mockedAxios.get.mockResolvedValue({});
    });

    it("should send GET", async () => {
      await validateAuthSessionId("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId");
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it("should send to /identityprovider", async () => {
      await validateAuthSessionId("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId");
      expect(mockedAxios.get).toHaveBeenCalledWith("/identityprovider", expect.any(Object));
    });

    it("should send with systemBaseUri as BaseURL", async () => {
      const systemBaseUri: string = "HiItsMeSystemBaseUri";
      await validateAuthSessionId(systemBaseUri, "HiItsMeAuthSessionId");
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        baseURL: systemBaseUri
      }));
    });

    it("should send with authSessionId as Authorization-Header", async () => {
      const authSessionId: string = "HiItsMeAuthSessionId";
      await validateAuthSessionId("HiItsMeSystemBaseUri", authSessionId);
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        headers: expect.objectContaining({ "Authorization": `Bearer ${authSessionId}` })
      }));
    });

    it("should send with follows: validate", async () => {
      await validateAuthSessionId("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId");
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        follows: ["validate"]
      }));
    });
  });

  describe("response", () => {

    it("should return user", async () => {

      const user: ScimUser = {
        name: {
          familyName: "HiItsMeFamilyName",
          givenName: "HiItsMeGivenName"
        },
      };

      mockedAxios.get.mockResolvedValue({
        data: user
      });

      const result: ScimUser = await validateAuthSessionId("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId");
      expect(result).toEqual(expect.objectContaining(user));
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
        await validateAuthSessionId("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId");
      } catch (e) {
        error = e;
      }

      expect(error instanceof UnauthorizedError).toBeTruthy();
      expect(error.message).toContain("Failed to validate authSessionId:");
      expect(error.response).toEqual(response);
    });

    it("should throw ForbiddenError on status 403", async () => {

      const response: AxiosResponse = {
        status: 403,
      } as AxiosResponse;

      mockedAxios.get.mockRejectedValue({ response });

      let error: ForbiddenError;
      try {
        await validateAuthSessionId("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId");
      } catch (e) {
        error = e;
      }

      expect(error instanceof ForbiddenError).toBeTruthy();
      expect(error.message).toContain("Failed to validate authSessionId:");
      expect(error.response).toEqual(response);
    });

    it("should throw NotFoundError on status 404", async () => {

      const response: AxiosResponse = {
        status: 404,
      } as AxiosResponse;

      mockedAxios.get.mockRejectedValue({ response });

      let error: NotFoundError;
      try {
        await validateAuthSessionId("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId");
      } catch (e) {
        error = e;
      }

      expect(error instanceof NotFoundError).toBeTruthy();
      expect(error.message).toContain("Failed to validate authSessionId:");
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
        await validateAuthSessionId("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId");
      } catch (e) {
        resultError = e;
      }

      expect(resultError).toBe(error);
      expect(resultError.message).toContain(errorString);
      expect(resultError.message).toContain("Failed to validate authSessionId:");
    });
  });
});