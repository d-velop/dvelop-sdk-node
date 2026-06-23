import { DvelopContext, dvelopFetch } from "@dvelop-sdk/core";
import { RequestAppSessionParams, onResponse, requestAppSession } from "./request-app-session";

jest.mock("@dvelop-sdk/core", () => {
  const actual = jest.requireActual("@dvelop-sdk/core");
  return { ...actual, dvelopFetch: jest.fn() };
});

const mockDvelopFetch = dvelopFetch as jest.MockedFunction<typeof dvelopFetch>;

describe("requestAppSession", () => {

  let context: DvelopContext;
  let params: RequestAppSessionParams;

  beforeEach(() => {
    jest.resetAllMocks();
    context = { systemBaseUri: "HiItsMeSystemBaseUri", requestId: "HiItsMeRequestId" };
    params = { appName: "HiItsMeAppName", callback: "HiItsMeCallBack" };
  });

  it("should call dvelopFetch with method POST and the correct body", async () => {
    await requestAppSession(context, params);

    expect(mockDvelopFetch).toHaveBeenCalledTimes(1);
    expect(mockDvelopFetch).toHaveBeenCalledWith(context, "/identityprovider/appsession", {
      method: "POST",
      body: JSON.stringify({
        appname: params.appName,
        callback: params.callback,
        requestid: context.requestId
      })
    }, expect.objectContaining({ onResponse: onResponse }));
  });

  it("should forward caller-supplied options", async () => {
    const options = { onResponse: jest.fn() };
    await requestAppSession(context, params, options);
    expect(mockDvelopFetch.mock.calls[0][3]).toBe(options);
  });

  describe("onResponse", () => {

    it("should resolve without a value on success", async () => {
      const response = new Response(null, { status: 200 });
      await expect(onResponse(response)).resolves.toBeUndefined();
    });
  });
});
