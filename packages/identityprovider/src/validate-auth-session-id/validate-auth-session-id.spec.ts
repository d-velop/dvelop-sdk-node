import axios from "axios";
import { validateAuthSessionId } from "./validate-auth-session-id";

jest.mock("axios");

describe("validateAuthsessionId", () => {

  const mockedAxios = axios as jest.Mocked<typeof axios>;

  beforeEach(() => {
    mockedAxios.get.mockReset();
  });

  it("should make GET with correct URI", async () => {

    const systemBaseUri = "HiItsMeSystemBaseUri";
    mockedAxios.get.mockResolvedValue({});

    await validateAuthSessionId(systemBaseUri, "HiItsMeAuthSessionId");

    expect(mockedAxios.get).toBeCalledWith(`${systemBaseUri}/identityprovider/validate`, expect.any(Object));
  });

  it("should make GET with correct headers", async () => {

    const authSessionId = "HiItsMeAuthSessionId";
    mockedAxios.get.mockResolvedValue({});

    await validateAuthSessionId("HiItsMeSystemBaseUri", authSessionId);

    expect(mockedAxios.get).toBeCalledWith(expect.any(String), { headers: { "Authorization": `Bearer ${authSessionId}` } });
  });

  it("should return response.data object", async () => {

    const data = { hi: "ItsMeDataObject" };
    mockedAxios.get.mockResolvedValue({ data });

    const user = await validateAuthSessionId("HiItsMeSystemBaseUri", "HiItsMeAuthSessionId");

    expect(user).toEqual(data);
  });
});
