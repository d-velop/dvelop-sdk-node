import { DvelopContext, dvelopFetch } from "@dvelop-sdk/core";
import { GetImpersonatedAuthSessionIdParams, onResponse, getImpersonatedAuthSessionId } from "./get-impersonated-auth-session-id";

jest.mock("@dvelop-sdk/core", () => {
  const actual = jest.requireActual("@dvelop-sdk/core");
  return { ...actual, dvelopFetch: jest.fn() };
});

const mockDvelopFetch = dvelopFetch as jest.MockedFunction<typeof dvelopFetch>;

describe("getImpersonatedAuthSessionId", () => {

  let context: DvelopContext;
  let params: GetImpersonatedAuthSessionIdParams;

  beforeEach(() => {
    jest.resetAllMocks();
    context = { systemBaseUri: "HiItsMeSystemBaseUri" };
    params = { userId: "HiItsMeUserId" };
  });

  it("should call dvelopFetch with method GET and encoded userId", async () => {
    await getImpersonatedAuthSessionId(context, params);

    expect(mockDvelopFetch).toHaveBeenCalledTimes(1);
    expect(mockDvelopFetch).toHaveBeenCalledWith(context, "/identityprovider/impersonatesession?userId=HiItsMeUserId", { method: "GET" }, expect.objectContaining({ onResponse: onResponse }));
  });

  it("should encode special characters in the userId", async () => {
    await getImpersonatedAuthSessionId(context, { userId: "user/with spaces" });
    expect(mockDvelopFetch.mock.calls[0][1]).toBe("/identityprovider/impersonatesession?userId=user%2Fwith%20spaces");
  });

  it("should forward caller-supplied options", async () => {
    const options = { onResponse: jest.fn() };
    await getImpersonatedAuthSessionId(context, params, options);
    expect(mockDvelopFetch.mock.calls[0][3]).toBe(options);
  });

  describe("onResponse", () => {

    function jsonResponse(data: any): Response {
      return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    it("should return the authSessionId from the response body", async () => {
      const result: string = await onResponse(jsonResponse({ authSessionId: "HiItsMeAuthSessionId" }));
      expect(result).toEqual("HiItsMeAuthSessionId");
    });
  });
});
