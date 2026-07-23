import { DvelopContext, dvelopFetch } from "@dvelop-sdk/core";
import { DvelopUser, onResponse, validateAuthSessionId } from "./validate-auth-session-id";

jest.mock("@dvelop-sdk/core", () => {
  const actual = jest.requireActual("@dvelop-sdk/core");
  return { ...actual, dvelopFetch: jest.fn() };
});

const mockDvelopFetch = dvelopFetch as jest.MockedFunction<typeof dvelopFetch>;

describe("validateAuthSessionId", () => {

  let context: DvelopContext;

  beforeEach(() => {
    jest.resetAllMocks();
    context = { systemBaseUri: "HiItsMeSystemBaseUri" };
  });

  it("should call dvelopFetch with method GET", async () => {
    await validateAuthSessionId(context);

    expect(mockDvelopFetch).toHaveBeenCalledTimes(1);
    expect(mockDvelopFetch).toHaveBeenCalledWith(context, "/identityprovider/validate", { method: "GET" }, expect.objectContaining({ onResponse: onResponse }));
  });

  it("should forward caller-supplied options", async () => {
    const options = { onResponse: jest.fn() };
    await validateAuthSessionId(context, options);
    expect(mockDvelopFetch.mock.calls[0][3]).toBe(options);
  });

  describe("onResponse", () => {

    function jsonResponse(data: any): Response {
      return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    it("should return the user from the response body", async () => {
      const data = {
        name: {
          familyName: "HiItsMeFamilyName",
          givenName: "HiItsMeGivenName"
        }
      };

      const result: DvelopUser = await onResponse(jsonResponse(data));

      expect(result.name.familyName).toEqual(data.name.familyName);
      expect(result.name.givenName).toEqual(data.name.givenName);
    });
  });
});
