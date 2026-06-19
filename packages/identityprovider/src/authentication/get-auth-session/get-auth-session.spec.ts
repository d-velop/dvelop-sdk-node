import { DvelopContext, dvelopFetch } from "@dvelop-sdk/core";
import { AuthSession, onResponse, getAuthSession } from "./get-auth-session";

jest.mock("@dvelop-sdk/core", () => {
  const actual = jest.requireActual("@dvelop-sdk/core");
  return { ...actual, dvelopFetch: jest.fn() };
});

const mockDvelopFetch = dvelopFetch as jest.MockedFunction<typeof dvelopFetch>;

describe("getAuthSession", () => {

  let context: DvelopContext;

  beforeEach(() => {
    jest.resetAllMocks();
    context = { systemBaseUri: "HiItsMeSystemBaseUri" };
  });

  it("should call dvelopFetch with method GET", async () => {
    await getAuthSession(context);

    expect(mockDvelopFetch).toHaveBeenCalledTimes(1);
    expect(mockDvelopFetch).toHaveBeenCalledWith(context, "/identityprovider/login", { method: "GET" }, expect.objectContaining({ onResponse: onResponse }));
  });

  it("should forward caller-supplied options", async () => {
    const options = { onResponse: jest.fn() };
    await getAuthSession(context, options);
    expect(mockDvelopFetch.mock.calls[0][3]).toBe(options);
  });

  describe("onResponse", () => {

    function jsonResponse(data: any): Response {
      return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    it("should map and transform the auth session", async () => {
      const data = {
        AuthSessionId: "HiItsMeAuthSessionId",
        Expire: "1992-02-16T16:11:03.000Z"
      };

      const result: AuthSession = await onResponse(jsonResponse(data));

      expect(result.id).toBe("HiItsMeAuthSessionId");
      expect(result.expire).toEqual(new Date("1992-02-16T16:11:03.000Z"));
    });
  });
});
