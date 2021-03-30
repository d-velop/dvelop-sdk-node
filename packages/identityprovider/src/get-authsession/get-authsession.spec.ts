import axios from "axios";
import { getAuthsession, AuthsessionDto } from "./get-authsession";

jest.mock("axios");

describe("validateAuthsessionId", () => {

  const mockedAxios = axios as jest.Mocked<typeof axios>;

  beforeEach(() => {
    mockedAxios.get.mockReset();
  });

  it("should make GET with correct URI", async () => {

    const systemBaseUri = "HiItsMeSystemBaseUri";
    const data: AuthsessionDto = { AuthSessionId: "HiItsMeAuthSessionId", Expire: "1992-02-16T13:29:21.8163512Z" };
    mockedAxios.get.mockResolvedValue({ data });

    await getAuthsession(systemBaseUri, "HiItsMeApiKey");

    expect(mockedAxios.get).toBeCalledWith(`${systemBaseUri}/identityprovider/login`, expect.any(Object));
  });

  it("should make GET with correct headers", async () => {

    const apiKey = "HiItsMeApiKey";
    const data: AuthsessionDto = { AuthSessionId: "HiItsMeAuthSessionId", Expire: "1992-02-16T13:29:21.8163512Z" };
    mockedAxios.get.mockResolvedValue({ data });

    await getAuthsession("HiItsMeSystemBaseUri", apiKey);

    expect(mockedAxios.get).toBeCalledWith(expect.any(String), { headers: { "Authorization": `Bearer ${apiKey}` } });
  });

  it("should return response.data object", async () => {

    const data: AuthsessionDto = { AuthSessionId: "HiItsMeAuthSessionId", Expire: "1992-02-16T13:29:21.8163512Z" };
    mockedAxios.get.mockResolvedValue({ data });

    const authsession = await getAuthsession("HiItsMeSystemBaseUri", "HiItsMeApiKey");

    expect(authsession.id).toEqual(data.AuthSessionId);
    expect(authsession.expire).toEqual(new Date(data.Expire));
  });

  it("should throw error on http-error", async () => {

    const error: Error = new Error("HiItsMeError");
    mockedAxios.get.mockRejectedValue(error);

    await expect(getAuthsession("HiItsMeSystemBaseUri", "HiItsMeApiKey")).rejects.toThrowError(`Failed to get Authsession for given API-Key.\n${error}`);
  });
});